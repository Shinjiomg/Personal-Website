import { createSignal, onMount, createEffect } from 'solid-js';
import emailjs from '@emailjs/browser';
import { toast } from 'solid-toast';

export default function ContactForm() {
    let formRef;
    const [isSending, setIsSending] = createSignal(false);
    const [formValid, setFormValid] = createSignal(false);
    const [errors, setErrors] = createSignal({});
    const [touched, setTouched] = createSignal({});
    const [lang, setLang] = createSignal('es');
    
    const translations = {
        es: {
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
        en: {
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
    };
    
    const t = () => translations[lang()];
    
    onMount(() => {
        const saved = localStorage.getItem('language');
        setLang((saved === 'es' || saved === 'en') ? saved : 'es');
        
        window.addEventListener('languagechange', () => {
            const newLang = localStorage.getItem('language') || 'es';
            setLang(newLang);
        });
    });

    const validateField = (name, value) => {
        const newErrors = { ...errors() };
        const tForm = t().form;
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = tForm.errors.nameRequired;
                } else if (value.trim().length < 2) {
                    newErrors.name = tForm.errors.nameMin;
                } else {
                    delete newErrors.name;
                }
                break;
            case 'email':
                if (!value.trim()) {
                    newErrors.email = tForm.errors.emailRequired;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = tForm.errors.emailInvalid;
                } else {
                    delete newErrors.email;
                }
                break;
            case 'message':
                if (!value.trim()) {
                    newErrors.message = tForm.errors.messageRequired;
                } else if (value.trim().length < 10) {
                    newErrors.message = tForm.errors.messageMin;
                } else {
                    delete newErrors.message;
                }
                break;
        }
        
        setErrors(newErrors);
        setFormValid(formRef.checkValidity() && Object.keys(newErrors).length === 0);
    };

    const handleBlur = (name, value) => {
        setTouched({ ...touched(), [name]: true });
        validateField(name, value);
    };

    const sendEmail = async (event) => {
        event.preventDefault();
        setIsSending(true);

        const promise = emailjs.sendForm(
            import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
            import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
            formRef,
            import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY
        );

        const tForm = t().form;
        toast.promise(promise, {
            loading: tForm.sending,
            success: () => (
                <div class="toast-custom">
                    <p>{tForm.success}</p>
                </div>
            ),
            error: () => (
                <div class="toast-custom">
                    <p>{tForm.error}</p>
                </div>
            ),
        });

        try {
            await promise;
            formRef.reset();
            setFormValid(false);
            setErrors({});
            setTouched({});
        } catch (error) {
            console.error('Error al enviar el correo:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleInputChange = (name, value) => {
        if (touched()[name]) {
            validateField(name, value);
        }
        setFormValid(formRef.checkValidity() && Object.keys(errors()).length === 0);
    };

    return (
        <form ref={(el) => (formRef = el)}
            onSubmit={sendEmail}
            method="POST"
            class="h-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 flex flex-col"
        >
            <div>
                <h3 class="text-2xl font-bold text-white mb-2" data-i18n-contact="form.title">
                    {t().form.title}
                </h3>
                <p class="text-gray-400 text-sm" data-i18n-contact="form.description">
                    {t().form.description}
                </p>
            </div>

            <div class="space-y-5 flex-grow">
                <div>
                    <label
                        for="name"
                        class="block text-sm font-semibold text-gray-300 mb-2"
                        data-i18n-contact="form.name"
                    >
                        {t().form.name}
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder={t().form.namePlaceholder}
                        data-i18n-placeholder="contact.form.namePlaceholder"
                        class={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary transition-all duration-300 ${
                            touched().name && errors().name 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-700/50 focus:border-primary'
                        }`}
                        required
                        onInput={(e) => handleInputChange('name', e.target.value)}
                        onBlur={(e) => handleBlur('name', e.target.value)}
                        aria-invalid={touched().name && errors().name ? 'true' : 'false'}
                        aria-describedby={touched().name && errors().name ? 'name-error' : undefined}
                    />
                    {touched().name && errors().name && (
                        <p id="name-error" class="mt-1 text-sm text-red-400" role="alert">
                            {errors().name}
                        </p>
                    )}
                </div>
                
                <div>
                    <label
                        for="email"
                        class="block text-sm font-semibold text-gray-300 mb-2"
                        data-i18n-contact="form.email"
                    >
                        {t().form.email}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder={t().form.emailPlaceholder}
                        data-i18n-placeholder="contact.form.emailPlaceholder"
                        class={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary transition-all duration-300 ${
                            touched().email && errors().email 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-700/50 focus:border-primary'
                        }`}
                        required
                        onInput={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        aria-invalid={touched().email && errors().email ? 'true' : 'false'}
                        aria-describedby={touched().email && errors().email ? 'email-error' : undefined}
                    />
                    {touched().email && errors().email && (
                        <p id="email-error" class="mt-1 text-sm text-red-400" role="alert">
                            {errors().email}
                        </p>
                    )}
                </div>
                
                <div>
                    <label
                        for="message"
                        class="block text-sm font-semibold text-gray-300 mb-2"
                        data-i18n-contact="form.message"
                    >
                        {t().form.message}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        placeholder={t().form.messagePlaceholder}
                        data-i18n-placeholder="contact.form.messagePlaceholder"
                        class={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary transition-all duration-300 resize-none ${
                            touched().message && errors().message 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-700/50 focus:border-primary'
                        }`}
                        required
                        onInput={(e) => handleInputChange('message', e.target.value)}
                        onBlur={(e) => handleBlur('message', e.target.value)}
                        aria-invalid={touched().message && errors().message ? 'true' : 'false'}
                        aria-describedby={touched().message && errors().message ? 'message-error' : undefined}
                    ></textarea>
                    {touched().message && errors().message && (
                        <p id="message-error" class="mt-1 text-sm text-red-400" role="alert">
                            {errors().message}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                class={`w-full group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    isSending() || !formValid()
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 click-scale btn-ripple'
                }`}
                disabled={isSending() || !formValid()}
                aria-busy={isSending()}
            >
                <div class="absolute inset-0 bg-primary"></div>
                {/* Shine effect */}
                {!isSending() && !formValid() && (
                    <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                )}
                <span class="relative z-10 flex items-center justify-center gap-2">
                    {isSending() ? (
                        <>
                            <svg class="animate-spin-smooth h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span data-i18n-contact="form.sending">{t().form.sending}</span>
                        </>
                    ) : (
                        <>
                            <span data-i18n-contact="form.send">{t().form.send}</span>
                            <svg
                                class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                ></path>
                            </svg>
                        </>
                    )}
                </span>
            </button>
        </form>
    )
}