interface ShareWhatsAppParams {
    url: string;
    title?: string;
}

// Receives an object with url and title passed as strings. Safely opens a new tab with a WhatsApp sharing modal window.
const shareWhatsApp = ({ title, url }: ShareWhatsAppParams): void => {
    const prefix = title ? `${title}\n` : '';

    const params = new URLSearchParams({
        text: `${prefix}${url}`
    });

    const newTabUrl = `https://wa.me/?${params}`;

    window.open(newTabUrl, '_blank', 'noopener noreferrer');
};

export { shareWhatsApp };
