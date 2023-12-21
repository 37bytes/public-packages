interface ShareVkParams {
    url: string;
    title?: string;
    image?: string;
}

// Receives an object with url, title and image passed as strings. Safely opens a new tab with a VK sharing modal window.
const shareVk = ({ title, image, url }: ShareVkParams): void => {
    const params = new URLSearchParams({
        url,
        ...(title ? { title } : {}),
        ...(image ? { image } : {})
    });

    const newTabUrl = `https://vk.com/share.php?${params}`;

    window.open(newTabUrl, '_blank', 'noopener noreferrer');
};

export default shareVk;
