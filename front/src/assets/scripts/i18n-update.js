// Global i18n update script
(function() {
    const translations = {
        es: {
            nav: {
                home: 'Inicio',
                about: 'Sobre mí',
                education: 'Educación',
                experience: 'Experiencia',
                projects: 'Proyectos',
                contact: 'Contacto',
            },
            hero: {
                available: 'Disponible para trabajar',
                greeting: 'Hola, soy',
                name: 'Jhonatan Becerra',
                role: 'Desarrollador',
                roleHighlight: 'Frontend',
                description: 'Especializado en crear',
                descriptionHighlight: 'experiencias digitales excepcionales',
                descriptionRest: ' que combinan diseño elegante con código de alta calidad.',
                ctaExperience: 'Ver mi experiencia',
                ctaProjects: 'Ver proyectos',
                stats: {
                    years: 'Años de experiencia',
                    projects: 'Proyectos completados',
                    satisfaction: 'Clientes satisfechos',
                },
                scroll: 'Desplázate',
            },
            about: {
                badge: 'Sobre Mí',
                title: 'Construyendo el',
                titleHighlight: 'futuro digital',
                subtitle: 'Con pasión por la excelencia y atención al detalle',
                description1: 'Soy un',
                description1Highlight: 'desarrollador frontend',
                description1Rest: 'con más de 3 años de experiencia especializado en crear experiencias web excepcionales. Mi enfoque combina diseño elegante con código de alta calidad.',
                description2: 'Me apasiona transformar ideas complejas en interfaces intuitivas y funcionales, siempre priorizando la experiencia del usuario y el rendimiento. Busco formar parte de un equipo donde pueda aportar mi experiencia y seguir creciendo profesionalmente.',
                skillsTitle: 'Habilidades Técnicas',
                downloadCV: 'Descargar CV',
            },
            education: {
                badge: 'Formación',
                title: 'Educación y',
                titleHighlight: 'Certificaciones',
                subtitle: 'Mi trayectoria académica y desarrollo profesional continuo',
                formalTitle: 'Educación Formal',
                inProgress: 'En curso',
                completed: 'Completado',
                coursesTitle: 'Cursos destacados',
                certificationsTitle: 'Certificaciones',
            },
            experience: {
                badge: 'Trayectoria',
                title: 'Experiencia',
                titleHighlight: 'Profesional',
                subtitle: 'Un recorrido por mi evolución como desarrollador frontend',
            },
            projects: {
                badge: 'Portafolio',
                title: 'Proyectos',
                titleHighlight: 'Destacados',
                subtitle: 'Proyectos personales que demuestran mi experiencia y creatividad',
                disclaimer: 'He desarrollado múltiples proyectos internos en',
                disclaimerAnd: 'y',
                disclaimerText: 'que no puedo mostrar por confidencialidad',
                viewProject: 'Ver proyecto',
            },
            contact: {
                badge: 'Contacto',
                title: '¿Interesado en',
                titleHighlight: 'Contratarme?',
                subtitle: 'Estoy buscando nuevas oportunidades laborales. ¡Hablemos sobre cómo puedo aportar valor a tu equipo!',
                readyTitle: '¿Listo para conocerme?',
                readyDescription: 'Estoy disponible para nuevas oportunidades laborales. ¡Hablemos sobre cómo puedo contribuir a tu equipo!',
                email: 'Email',
                phone: 'Teléfono',
                location: 'Ubicación',
                downloadCV: 'Descargar CV',
                form: {
                    title: 'Envíame un mensaje',
                    description: 'Completa el formulario y me pondré en contacto contigo lo antes posible.',
                    name: 'Nombre completo',
                    namePlaceholder: 'Tu nombre',
                    email: 'Correo electrónico',
                    emailPlaceholder: 'tu@email.com',
                    message: 'Mensaje',
                    messagePlaceholder: 'Cuéntame sobre tu oportunidad laboral...',
                    send: 'Enviar Mensaje',
                    sending: 'Enviando...',
                    success: '¡Correo enviado correctamente!',
                    error: 'Hubo un error al enviar el correo.',
                    errors: {
                        nameRequired: 'El nombre es requerido',
                        nameMin: 'El nombre debe tener al menos 2 caracteres',
                        emailRequired: 'El correo electrónico es requerido',
                        emailInvalid: 'Ingresa un correo electrónico válido',
                        messageRequired: 'El mensaje es requerido',
                        messageMin: 'El mensaje debe tener al menos 10 caracteres',
                    },
                },
            },
            footer: {
                description: 'Desarrollador Frontend especializado en crear experiencias web excepcionales con las últimas tecnologías modernas.',
                techStack: 'Stack Tecnológico',
                madeWith: 'Hecho con',
                copyright: 'Todos los derechos reservados.',
            },
            floatingCTA: {
                full: 'Contáctame',
                short: 'Contacto',
            },
        },
        en: {
            nav: {
                home: 'Home',
                about: 'About',
                education: 'Education',
                experience: 'Experience',
                projects: 'Projects',
                contact: 'Contact',
            },
            hero: {
                available: 'Available for work',
                greeting: 'Hello, I am',
                name: 'Jhonatan Becerra',
                role: 'Developer',
                roleHighlight: 'Frontend',
                description: 'Specialized in creating',
                descriptionHighlight: 'exceptional digital experiences',
                descriptionRest: ' that combine elegant design with high-quality code.',
                ctaExperience: 'View my experience',
                ctaProjects: 'View projects',
                stats: {
                    years: 'Years of experience',
                    projects: 'Projects completed',
                    satisfaction: 'Client satisfaction',
                },
                scroll: 'Scroll',
            },
            about: {
                badge: 'About Me',
                title: 'Building the',
                titleHighlight: 'digital future',
                subtitle: 'With passion for excellence and attention to detail',
                description1: 'I am a',
                description1Highlight: 'frontend developer',
                description1Rest: 'with over 3 years of experience specialized in creating exceptional web experiences. My approach combines elegant design with high-quality code.',
                description2: 'I am passionate about transforming complex ideas into intuitive and functional interfaces, always prioritizing user experience and performance. I seek to be part of a team where I can contribute my experience and continue growing professionally.',
                skillsTitle: 'Technical Skills',
                downloadCV: 'Download CV',
            },
            education: {
                badge: 'Education',
                title: 'Education and',
                titleHighlight: 'Certifications',
                subtitle: 'My academic journey and continuous professional development',
                formalTitle: 'Formal Education',
                inProgress: 'In progress',
                completed: 'Completed',
                coursesTitle: 'Featured courses',
                certificationsTitle: 'Certifications',
            },
            experience: {
                badge: 'Career',
                title: 'Professional',
                titleHighlight: 'Experience',
                subtitle: 'A journey through my evolution as a frontend developer',
            },
            projects: {
                badge: 'Portfolio',
                title: 'Featured',
                titleHighlight: 'Projects',
                subtitle: 'Personal projects that demonstrate my experience and creativity',
                disclaimer: 'I have developed multiple internal projects at',
                disclaimerAnd: 'and',
                disclaimerText: 'that I cannot show due to confidentiality',
                viewProject: 'View project',
            },
            contact: {
                badge: 'Contact',
                title: 'Interested in',
                titleHighlight: 'Hiring Me?',
                subtitle: 'I am looking for new job opportunities. Let\'s talk about how I can add value to your team!',
                readyTitle: 'Ready to meet me?',
                readyDescription: 'I am available for new job opportunities. Let\'s talk about how I can contribute to your team!',
                email: 'Email',
                phone: 'Phone',
                location: 'Location',
                downloadCV: 'Download CV',
                form: {
                    title: 'Send me a message',
                    description: 'Fill out the form and I will get back to you as soon as possible.',
                    name: 'Full name',
                    namePlaceholder: 'Your name',
                    email: 'Email',
                    emailPlaceholder: 'your@email.com',
                    message: 'Message',
                    messagePlaceholder: 'Tell me about your job opportunity...',
                    send: 'Send Message',
                    sending: 'Sending...',
                    success: 'Email sent successfully!',
                    error: 'There was an error sending the email.',
                    errors: {
                        nameRequired: 'Name is required',
                        nameMin: 'Name must be at least 2 characters',
                        emailRequired: 'Email is required',
                        emailInvalid: 'Enter a valid email address',
                        messageRequired: 'Message is required',
                        messageMin: 'Message must be at least 10 characters',
                    },
                },
            },
            footer: {
                description: 'Frontend Developer specialized in creating exceptional web experiences with the latest modern technologies.',
                techStack: 'Tech Stack',
                madeWith: 'Made with',
                copyright: 'All rights reserved.',
            },
            floatingCTA: {
                full: 'Contact me',
                short: 'Contact',
            },
        },
    };
    
    function getLanguage() {
        const saved = localStorage.getItem('language');
        return (saved === 'es' || saved === 'en') ? saved : 'es';
    }
    
    function updateAllTranslations() {
        const lang = getLanguage();
        const t = translations[lang];
        
        // Helper to get nested translation
        function getNested(obj, path) {
            return path.split('.').reduce((o, p) => o && o[p], obj);
        }
        
        // Update all elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                const value = getNested(t, key);
                if (value !== undefined) {
                    el.textContent = value;
                }
            }
        });
        
        // Update specific sections with nested support
        ['nav', 'hero', 'about', 'education', 'experience', 'projects', 'contact', 'footer'].forEach((section) => {
            document.querySelectorAll(`[data-i18n-${section}]`).forEach((el) => {
                const key = el.getAttribute(`data-i18n-${section}`);
                if (key) {
                    const value = getNested(t[section], key);
                    if (value !== undefined) {
                        el.textContent = value;
                    }
                }
            });
        });
        
        // Update floatingCTA
        document.querySelectorAll('[data-i18n="floatingCTA.full"]').forEach((el) => {
            const value = t.floatingCTA?.full;
            if (value !== undefined) {
                el.textContent = value;
            }
        });
        document.querySelectorAll('[data-i18n="floatingCTA.short"]').forEach((el) => {
            const value = t.floatingCTA?.short;
            if (value !== undefined) {
                el.textContent = value;
            }
        });
        
        // Update data-i18n with full path (e.g., hero.stats.years)
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                const value = getNested(t, key);
                if (value !== undefined) {
                    el.textContent = value;
                }
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                const value = getNested(t, key);
                if (value !== undefined && el.placeholder !== undefined) {
                    el.placeholder = value;
                }
            }
        });
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAllTranslations);
    } else {
        updateAllTranslations();
    }
    
    // Listen for language changes
    window.addEventListener('languagechange', updateAllTranslations);
})();
