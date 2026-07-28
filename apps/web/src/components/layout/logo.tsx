import Image from "next/image";
import Link from "next/link";

export function Logo() {
	return (
		<Link
			href={{ pathname: "/feed" }}
			aria-label="Arxio — ir para o feed"
			className="flex h-6.75 w-20 shrink-0 items-center justify-center rounded-[10px] bg-ax-brand px-2.5 py-1.5"
		>
			<Image
				src="/icons/logo-arxio-mark.png"
				alt="Arxio"
				width={753}
				height={256}
				className="h-full w-full object-contain"
				priority
			/>
		</Link>
	);
}
