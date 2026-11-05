use crate::ble::apple_proximity::BatteryState;
use tiny_skia::{Color, Paint, PathBuilder, Pixmap, Stroke, Transform};

pub const TRAY_ICON_SIZE: u32 = 64;

pub fn minimum_battery_level(battery: &BatteryState) -> Option<u8> {
    [battery.left, battery.right, battery.case]
        .into_iter()
        .flatten()
        .min()
}

pub fn color_for_battery(level: Option<u8>) -> Color {
    match level {
        Some(pct) if pct < 15 => Color::from_rgba8(255, 69, 58, 255),
        Some(pct) if pct < 30 => Color::from_rgba8(255, 214, 10, 255),
        Some(_) => Color::from_rgba8(48, 209, 88, 255),
        None => Color::from_rgba8(142, 142, 147, 255),
    }
}

pub fn render_tray_icon_rgba(battery: &BatteryState, connected: bool) -> Vec<u8> {
    let mut pixmap = Pixmap::new(TRAY_ICON_SIZE, TRAY_ICON_SIZE).unwrap_or_else(|| {
        Pixmap::new(16, 16).expect("valid fallback pixmap")
    });

    let center = (TRAY_ICON_SIZE as f32) * 0.5;
    let radius = 24.0_f32;
    let stroke_width = 6.0_f32;

    let mut track_paint = Paint::default();
    track_paint.set_color(Color::from_rgba8(255, 255, 255, 52));
    track_paint.anti_alias = true;

    let mut stroke = Stroke {
        width: stroke_width,
        ..Stroke::default()
    };
    stroke.line_cap = tiny_skia::LineCap::Round;

    if let Some(circle_path) = PathBuilder::from_circle(center, center, radius) {
        pixmap.stroke_path(
            &circle_path,
            &track_paint,
            &stroke,
            Transform::identity(),
            None,
        );
    }

    let min_level = minimum_battery_level(battery);
    let pct = min_level.unwrap_or(if connected { 100 } else { 0 }).clamp(0, 100) as f32 / 100.0;

    if pct > 0.01 {
        let mut ring_paint = Paint::default();
        ring_paint.set_color(color_for_battery(min_level));
        ring_paint.anti_alias = true;

        let steps = 48usize;
        let max_angle = std::f32::consts::TAU * pct;
        let start_angle = -std::f32::consts::FRAC_PI_2;

        let mut pb = PathBuilder::new();
        for i in 0..=steps {
            let t = (i as f32) / (steps as f32);
            let angle = start_angle + max_angle * t;
            let x = center + radius * angle.cos();
            let y = center + radius * angle.sin();
            if i == 0 {
                pb.move_to(x, y);
            } else {
                pb.line_to(x, y);
            }
        }

        if let Some(arc_path) = pb.finish() {
            pixmap.stroke_path(
                &arc_path,
                &ring_paint,
                &stroke,
                Transform::identity(),
                None,
            );
        }
    }

    if connected {
        let mut dot_paint = Paint::default();
        dot_paint.set_color(Color::from_rgba8(10, 132, 255, 255));
        dot_paint.anti_alias = true;
        if let Some(dot) = PathBuilder::from_circle(center, center, 7.5) {
            pixmap.fill_path(
                &dot,
                &dot_paint,
                tiny_skia::FillRule::Winding,
                Transform::identity(),
                None,
            );
        }
    }

    pixmap.take()
}

pub fn format_tray_tooltip(
    device_name: &str,
    battery: &BatteryState,
    listening_mode: Option<&str>,
) -> String {
    let l = battery
        .left
        .map(|v| format!("{}%", v))
        .unwrap_or_else(|| "—".to_string());
    let r = battery
        .right
        .map(|v| format!("{}%", v))
        .unwrap_or_else(|| "—".to_string());
    let c = battery
        .case
        .map(|v| format!("{}%", v))
        .unwrap_or_else(|| "—".to_string());

    match listening_mode {
        Some(mode) => format!("{} • L {} | R {} | Caja {} • {}", device_name, l, r, c, mode),
        None => format!("{} • L {} | R {} | Caja {}", device_name, l, r, c),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_minimum_battery_and_icon_generation() {
        let bat = BatteryState {
            left: Some(80),
            right: Some(20),
            case: Some(60),
        };
        assert_eq!(minimum_battery_level(&bat), Some(20));
        let bytes = render_tray_icon_rgba(&bat, true);
        assert_eq!(bytes.len(), (TRAY_ICON_SIZE * TRAY_ICON_SIZE * 4) as usize);
        let tip = format_tray_tooltip("Pro 3", &bat, Some("ANC"));
        assert!(tip.contains("L 80%"));
        assert!(tip.contains("R 20%"));
        assert!(tip.contains("Caja 60%"));
    }
}
