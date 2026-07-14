import { FeedDiscoverPanel } from "@/components/feed/feed-discover-panel";
import { FeedRecommendations } from "@/components/feed/feed-recommendations";
import { SiteHeader } from "@/components/layout/site-header";

export default function FeedPage() {
	return (
		<div className="min-h-dvh bg-white">
			<SiteHeader />

			<main className="mx-auto flex max-w-360 gap-12 px-20 pt-13.5 pb-16">
				<FeedRecommendations />
				<FeedDiscoverPanel />
			</main>
		</div>
	);
}
