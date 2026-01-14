import { createSignal } from 'solid-js';
import emailjs from '@emailjs/browser';
import { toast } from 'solid-toast';

export default function ContactForm() {
    let formRef;
    const [isSending, setIsSending] = createSignal(false);
    const [formValid, setFormValid] = createSignal(false);
    const [errors, setErrors] = createSignal({});
    const [touched, setTouched] = createSignal({});

    const validateField = (name, value) => {
        const newErrors = { ...errors() };
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'El nombre es requerido';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'El nombre debe tener al menos 2 caracteres';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'El correo electrónico es requerido';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Ingresa un correo electrónico válido';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'message':
                if (!value.trim()) {
                    newErrors.message = 'El mensaje es requerido';
                } else if (value.trim().length < 10) {
                    newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
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

        toast.promise(promise, {
            loading: 'Enviando mensaje...',
            success: () => (
                <div class="toast-custom">
                    <p>¡Correo enviado correctamente!</p>
                </div>
            ),
            error: () => (
                <div class="toast-custom">
                    <p>Hubo un error al enviar el correo.</p>
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
                <h3 class="text-2xl font-bold text-white mb-2">
                    Envíame un mensaje
                </h3>
                <p class="text-gray-400 text-sm">
                    Completa el formulario y me pondré en contacto contigo lo antes posible.
                </p>
            </div>

            <div class="space-y-5 flex-grow">
                <div>
                    <label
                        for="name"
                        class="block text-sm font-semibold text-gray-300 mb-2"
                    >
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Tu nombre"
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
                    >
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="tu@email.com"
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
                    >
                        Mensaje
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        placeholder="Cuéntame sobre tu oportunidad laboral..."
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
                        : 'hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
                }`}
                disabled={isSending() || !formValid()}
                aria-busy={isSending()}
            >
                <div class="absolute inset-0 bg-primary"></div>
                <span class="relative z-10 flex items-center justify-center gap-2">
                    {isSending() ? (
                        <>
                            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                        </>
                    ) : (
                        <>
                            Enviar Mensaje
                            <svg
                                class="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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