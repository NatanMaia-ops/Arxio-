"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ReactNode } from "react";

type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	cancelLabel?: string;
	isConfirming?: boolean;
	confirmingLabel?: string;
	onConfirm: () => void;
	trigger?: ReactNode;
};

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel = "Cancelar",
	isConfirming = false,
	confirmingLabel = "Removendo...",
	onConfirm,
	trigger,
}: ConfirmDialogProps) {
	return (
		<AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			{trigger ? (
				<AlertDialogPrimitive.Trigger render={trigger as never} />
			) : null}
			<AlertDialogPrimitive.Portal>
				<AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
				<AlertDialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-2xl border border-ax-line bg-ax-surface p-6 shadow-lg">
					<AlertDialogPrimitive.Title className="font-home-display font-semibold text-[22px] text-ax-ink leading-7">
						{title}
					</AlertDialogPrimitive.Title>
					<AlertDialogPrimitive.Description className="text-ax-ink-soft text-base leading-6">
						{description}
					</AlertDialogPrimitive.Description>
					<div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={isConfirming}
							className="inline-flex min-h-11 items-center justify-center rounded-full border border-ax-line px-4.5 font-medium text-ax-ink-soft text-sm transition-colors hover:border-ax-ink hover:text-ax-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface disabled:opacity-50"
						>
							{cancelLabel}
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isConfirming}
							className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-700 px-4.5 font-medium text-sm text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 focus-visible:ring-offset-ax-surface disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-500"
						>
							{isConfirming ? confirmingLabel : confirmLabel}
						</button>
					</div>
				</AlertDialogPrimitive.Popup>
			</AlertDialogPrimitive.Portal>
		</AlertDialogPrimitive.Root>
	);
}
