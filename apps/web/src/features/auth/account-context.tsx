"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

import { getSession } from "@/features/auth/services/get-session";
import { getOwnAccount } from "@/features/profile/services/profiles";

export type Account =
	| { status: "loading" }
	| {
			status: "authenticated";
			userId: string;
			name: string | null;
			avatarUrl: string | null;
	  }
	| { status: "unauthenticated" };

const AccountContext = createContext<Account>({ status: "loading" });

export function useAccount(): Account {
	return useContext(AccountContext);
}

export function AccountProvider({ children }: { children: ReactNode }) {
	const [account, setAccount] = useState<Account>({ status: "loading" });

	useEffect(() => {
		let isActive = true;

		getSession()
			.then(async (session) => {
				if (!isActive) return;

				if (!session) {
					setAccount({ status: "unauthenticated" });
					return;
				}

				let name = session.user.name;
				let avatarUrl = session.user.image;

				try {
					const own = await getOwnAccount();
					name = own.name;
					avatarUrl = own.avatarUrl;
				} catch {
					// A sessao continua valida; os dados dela sao o fallback.
				}

				if (isActive) {
					setAccount({
						status: "authenticated",
						userId: session.user.id,
						name,
						avatarUrl,
					});
				}
			})
			.catch(() => {
				if (isActive) setAccount({ status: "unauthenticated" });
			});

		return () => {
			isActive = false;
		};
	}, []);

	return (
		<AccountContext.Provider value={account}>
			{children}
		</AccountContext.Provider>
	);
}
