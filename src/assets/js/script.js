
// for sidebar test
document.addEventListener('alpine:init', () => {
    Alpine.data('xtestdata', () => ({
        // getThemeFromLocalStorage() {
        //     // if user already changed the theme, use it
        //     if (window.localStorage.getItem('dark')) {
        //         return JSON.parse(window.localStorage.getItem('dark'))
        //     }

        //     // else return their preferences
        //     return (
        //         !!window.matchMedia &&
        //         window.matchMedia('(prefers-color-scheme: dark)').matches
        //     )
        // },

        // setThemeToLocalStorage(value) {
        //     window.localStorage.setItem('dark', value)
        // },

        dark: false,
        toggleTheme() {
            this.dark = !this.dark
            // this.setThemeToLocalStorage(this.dark)
        },
        isSideMenuOpen: false,
        toggleSideMenu() {
            this.isSideMenuOpen = !this.isSideMenuOpen
        },
        closeSideMenu() {
            this.isSideMenuOpen = false
        },
        isNotificationsMenuOpen: false,
        toggleNotificationsMenu() {
            this.isNotificationsMenuOpen = !this.isNotificationsMenuOpen
        },
        closeNotificationsMenu() {
            this.isNotificationsMenuOpen = false
        },
        isProfileMenuOpen: false,
        toggleProfileMenu() {
            this.isProfileMenuOpen = !this.isProfileMenuOpen
        },
        closeProfileMenu() {
            this.isProfileMenuOpen = false
        },
        isPagesMenuOpen: false,
        togglePagesMenu() {
            this.isPagesMenuOpen = !this.isPagesMenuOpen
        },
        // Modal
        isModalOpen: false,
        trapCleanup: null,
        openModal() {
            this.isModalOpen = true
            this.trapCleanup = focusTrap(document.querySelector('#modal'))
        },
        closeModal() {
            this.isModalOpen = false
            this.trapCleanup()
        },

        // init() {
        //     this.data()
        // }
    }))
})

$(function () {

    
    window.onscroll = function () {
        const ud_header = document.querySelector(".ud-header");
        if (ud_header) { //to work at home page just
            const sticky = ud_header.offsetTop;
            const logo = document.querySelector(".header-logo");
    
            if (window.pageYOffset > sticky) {
                ud_header.classList.add("sticky");
            } else {
                ud_header.classList.remove("sticky");
            }
        }
    }

    // ===== responsive navbar
    let navbarToggler = document.querySelector("#navbarToggler");
    const navbarCollapse = document.querySelector("#navbarCollapse");

    if (navbarToggler) {
        navbarToggler.addEventListener("click", () => {
            navbarToggler.classList.toggle("navbarTogglerActive");
            navbarCollapse.classList.toggle("hidden");
        });
    }

    //===== close navbar-collapse when a  clicked
    document
        .querySelectorAll("#navbarCollapse ul li:not(.submenu-item) a")
        .forEach((e) =>
            e.addEventListener("click", () => {
                navbarToggler.classList.remove("navbarTogglerActive");
                navbarCollapse.classList.add("hidden");
            })
        );

    // ===== Sub-menu
    const submenuItems = document.querySelectorAll(".submenu-item");
    submenuItems.forEach((el) => {
        el.querySelector("a").addEventListener("click", () => {
            el.querySelector(".submenu").classList.toggle("hidden");
        });
    });
    //  // === logo change
    //  if (ud_header.classList.contains("sticky")) {
    //     logo.src = "assets/images/logo/logo.svg";
    //   } else {
    //     logo.src = "assets/images/logo/logo-white.svg";
    //   }

    // ===== wow js
    new WOW().init();

    //=====  particles
    if (document.getElementById("particles-1")) particlesJS("particles-1", {
        "particles": {
            "number": {
                "value": 40,
                "density": {
                    "enable": !0,
                    "value_area": 4000
                }
            },
            "color": {
                "value": ["#FFFFFF", "#FFFFFF", "#FFFFFF"]
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#fff"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 33,
                    "height": 33
                }
            },
            "opacity": {
                "value": 0.15,
                "random": !0,
                "anim": {
                    "enable": !0,
                    "speed": 0.2,
                    "opacity_min": 0.15,
                    "sync": !1
                }
            },
            "size": {
                "value": 50,
                "random": !0,
                "anim": {
                    "enable": !0,
                    "speed": 2,
                    "size_min": 5,
                    "sync": !1
                }
            },
            "line_linked": {
                "enable": !1,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": !0,
                "speed": 1,
                "direction": "top",
                "random": !0,
                "straight": !1,
                "out_mode": "out",
                "bounce": !1,
                "attract": {
                    "enable": !1,
                    "rotateX": 600,
                    "rotateY": 600
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": !1,
                    "mode": "bubble"
                },
                "onclick": {
                    "enable": !1,
                    "mode": "repulse"
                },
                "resize": !0
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1,
                    }
                },
                "bubble": {
                    "distance": 250,
                    "size": 0,
                    "duration": 2,
                    "opacity": 0,
                    "speed": 3
                },
                "repulse": {
                    "distance": 400,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": !0
    });

})
