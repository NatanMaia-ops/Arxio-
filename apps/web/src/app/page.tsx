import { CommunityRanking } from "@/components/landing/community-ranking";
import { FeaturedArticles } from "@/components/landing/featured-articles";
import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { RevealController } from "@/components/landing/reveal-controller";

export default function HomePage() {
	return (
		<div className="min-h-dvh overflow-x-hidden bg-ax-surface font-home-display text-ax-ink">
			<RevealController />
			<LandingHeader />
			<main>
				<LandingHero />
				<HowItWorks />
				<FeaturedArticles />
				<CommunityRanking />
				<FinalCta />
			</main>
			<LandingFooter />
		</div>
	);
}
