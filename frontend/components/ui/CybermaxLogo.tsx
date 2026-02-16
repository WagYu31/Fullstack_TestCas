import Image from 'next/image';

interface CybermaxLogoProps {
    className?: string;
    white?: boolean;
}

export default function CybermaxLogo({ className = "w-32 h-auto", white = false }: CybermaxLogoProps) {
    return (
        <Image
            src="/images/cybermax-logo.png"
            alt="Cybermax Indonesia"
            width={200}
            height={60}
            className={className}
            priority
        />
    );
}
