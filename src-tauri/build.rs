fn main() {
    #[cfg(target_os = "windows")]
    {
        let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
        let compat_dir = std::path::Path::new(&manifest_dir).join("compat");
        println!("cargo:rustc-link-search=native={}", compat_dir.display());
        println!("cargo:rustc-link-lib=static=msvc_compat");
        println!(
            "cargo:rerun-if-changed={}",
            compat_dir.join("libmsvc_compat.a").display()
        );
    }
    tauri_build::build();
}
