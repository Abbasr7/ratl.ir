document.addEventListener('alpine:init', () => {
    Alpine.data('test', () => ({
        open: false,
        toggle() {
            this.open = ! this.open
        }
    }))
})
