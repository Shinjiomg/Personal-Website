import { createSignal } from 'solid-js';
import emailjs from '@emailjs/browser';
import { toast } from 'solid-toast';

export default function ContactForm() {
    let formRef;
    const [isSending, setIsSending] = createSignal(false);
    const [formValid, setFormValid] = createSignal(false);



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
        } catch (error) {
            console.error('Error al enviar el correo:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleInputChange = () => {
        setFormValid(formRef.checkValidity());
    };

    return (
        <form ref={(el) => (formRef = el)}
            onSubmit={sendEmail}
            method="POST"
            class="bg-gradient-to-r from-gradient-start/5 to-gradient-end/5 backdrop-blur-sm rounded-xl p-5 border border-gradient-start/20 gap-4"
        >
            <div class="space-y-2 mb-4">
                <label
                    for="name"
                    class="block text-sm font-medium text-gray-300"
                >
                    Nombre completo
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    class="text-white w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                    onInput={handleInputChange}
                />
            </div>
            <div class="space-y-2">
                <label
                    for="email"
                    class="block text-sm font-medium text-gray-300"
                >
                    Correo electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    class="text-white w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                    onInput={handleInputChange}
                />
            </div>
            <div class="space-y-2 mb-4">
                <label
                    for="message"
                    class="block text-sm font-medium text-gray-300"
                >
                    Mensaje
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows="4"
                    class="text-white w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    required
                    onInput={handleInputChange}
                ></textarea>

            </div>
            <button
                type="submit"
                class={`w-full group relative px-8 py-4 rounded-lg font-medium text-white overflow-hidden ${isSending() || !formValid()
                    ? 'opacity-50 cursor-not-allowed'
                    : ''}`}
                disabled={isSending() || !formValid()}
            >
                <div
                    class="absolute inset-0 bg-primary transition-transform group-hover:scale-105"
                >
                </div>
                <span class="relative flex items-center justify-center">
                    {isSending() ? 'Enviando...' : 'Enviar Mensaje'}
                    <svg
                        class="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </span>
            </button>
        </form>
    )
}