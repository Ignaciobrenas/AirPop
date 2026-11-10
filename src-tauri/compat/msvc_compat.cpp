typedef unsigned __int64 size_t;
typedef unsigned __int64 uintptr_t;

extern "C" {
    void* malloc(size_t);
    void free(void*);
    void abort(void);
    void __std_terminate() { abort(); }
    uintptr_t __security_cookie = 0x2B992DDFA232;
    void __security_check_cookie(uintptr_t) {}
    int _Init_thread_epoch = 0;
    void _Init_thread_header(int* p) {
        if (*p == 0) *p = 1;
    }
    void _Init_thread_footer(int* p) {
        *p = 2;
    }
}

namespace std {
    struct nothrow_t {};
    extern const nothrow_t nothrow = {};
}

void* operator new(size_t size, const std::nothrow_t&) noexcept {
    return malloc(size);
}

void* operator new[](size_t size) {
    return malloc(size);
}

void operator delete(void* ptr, size_t) noexcept {
    free(ptr);
}

void operator delete[](void* ptr) noexcept {
    free(ptr);
}
