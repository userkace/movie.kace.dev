import { ReactNode, useEffect, useState } from "react";

import IosPwaLimitations from "@/components/buttons/IosPwaLimitations";
import { BrandPill } from "@/components/layout/BrandPill";
import { Player } from "@/components/player";
import { Widescreen } from "@/components/player/atoms/Widescreen";
import { useShouldShowControls } from "@/components/player/hooks/useShouldShowControls";
import { useIsMobile } from "@/hooks/useIsMobile";
import usePremiumStore from "@/stores/player/premiumSite";
import { PlayerMeta, playerStatus } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";

export interface PlayerPartProps {
  children?: ReactNode;
  backUrl: string;
  onLoad?: () => void;
  onMetaChange?: (meta: PlayerMeta) => void;
}

export function PlayerPart(props: PlayerPartProps) {
  const [isInIframe, setIsInIframe] = useState(false);
  const { showTargets, showTouchTargets } = useShouldShowControls();
  const status = usePlayerStore((s) => s.status);
  const { isMobile } = useIsMobile();
  const isLoading = usePlayerStore((s) => s.mediaPlaying.isLoading);
  const { isPremiumSite, isReferrerChecked } = usePremiumStore();

  useEffect(() => {
    setIsInIframe(window.parent !== window);
  }, []);

  // Detect if running as a PWA on iOS
  const isIOSPWA =
    /iPad|iPhone|iPod/i.test(navigator.userAgent) &&
    window.matchMedia("(display-mode: standalone)").matches;

  // Detect if Shift key is being held
  const [isShifting, setIsShifting] = useState(false);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
      setIsShifting(true);
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
      setIsShifting(false);
    }
  });

  return (
    <Player.Container onLoad={props.onLoad} showingControls={showTargets}>
      {props.children}
      <Player.BlackOverlay
        show={showTargets && status === playerStatus.PLAYING}
      />
      <Player.EpisodesRouter onChange={props.onMetaChange} />
      <Player.SettingsRouter />
      <Player.SubtitleView controlsShown={showTargets} />

      {status === playerStatus.PLAYING ? (
        <>
          <Player.CenterControls>
            <Player.LoadingSpinner />
            <Player.AutoPlayStart />
          </Player.CenterControls>
          <Player.CenterControls>
            <Player.CastingNotification />
          </Player.CenterControls>
        </>
      ) : null}

      <Player.CenterMobileControls
        className="text-white"
        show={showTouchTargets && status === playerStatus.PLAYING}
      >
        <Player.SkipBackward iconSizeClass="text-3xl" />
        <Player.Pause
          iconSizeClass="text-5xl"
          className={isLoading ? "opacity-0" : "opacity-100"}
        />
        <Player.SkipForward iconSizeClass="text-3xl" />
      </Player.CenterMobileControls>

      <Player.TopControls show={showTargets}>
        <div className="grid grid-cols-[1fr,auto] xl:grid-cols-3 items-center">
          <div className="flex space-x-3 items-center">
            {/* Conditional rendering based on isInIframe state */}
            {!isInIframe && (
              <>
                <Player.BackLink url={props.backUrl} />
                <span className="text mx-3 text-type-secondary">/</span>
              </>
            )}
            <Player.Title />
            {!isInIframe && <Player.BookmarkButton />}
          </div>
          <div className="text-center hidden xl:flex justify-center items-center">
            <Player.EpisodeTitle />
          </div>
          <div className="hidden sm:flex items-center justify-end">
            <div className="hidden sm:flex items-center justify-end">
              {isReferrerChecked && !isPremiumSite ? (
                isInIframe ? (
                  <div
                    onClick={() =>
                      window.open("https://www.vidbinge.com", "_blank")
                    }
                    style={{ cursor: "pointer" }} // Make the cursor a pointer if in iframe
                  >
                    <BrandPill clickable />
                  </div>
                ) : (
                  <BrandPill />
                )
              ) : null}
            </div>
          </div>
          <div className="flex sm:hidden items-center justify-end">
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Airplay />
                <Player.Chromecast />
              </>
            ) : null}
          </div>
        </div>
      </Player.TopControls>

      <Player.BottomControls show={showTargets}>
        <div className="flex items-center space-x-3">
          {status === playerStatus.PLAYING ? (
            <>
              {isMobile ? <Player.Time short /> : null}
              <Player.ProgressBar />
            </>
          ) : null}
        </div>
        <div className="hidden lg:flex justify-between" dir="ltr">
          <Player.LeftSideControls>
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Pause />
                <Player.SkipBackward />
                <Player.SkipForward />
                <Player.Volume />
                <Player.Time />
              </>
            ) : null}
          </Player.LeftSideControls>
          <div className="flex items-center space-x-3">
            <Player.Episodes />
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Pip />
                <Player.Airplay />
                <Player.Chromecast />
              </>
            ) : null}
            {status === playerStatus.PLAYBACK_ERROR ||
            status === playerStatus.PLAYING ? (
              <Player.Settings />
            ) : null}
            {/* Fullscreen on when not shifting */}
            {!isShifting && <Player.Fullscreen />}

            {/* Expand button visible when shifting */}
            {isShifting && (
              <div>
                <Widescreen />
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-[2.5rem,1fr,2.5rem] gap-3 lg:hidden">
          <div />
          <div className="flex justify-center space-x-3">
            {/* Disable PiP for iOS PWA */}
            {!isIOSPWA &&
              (status === playerStatus.PLAYING ? <Player.Pip /> : null)}
            <Player.Episodes />
            {status === playerStatus.PLAYING ? <Player.Settings /> : null}
            {/* Expand button for iOS PWA only */}
            {isIOSPWA && status === playerStatus.PLAYING && <Widescreen />}
          </div>
          <div>
            {/* Disable for iOS PWA */}
            {!isIOSPWA && (
              <div>
                <Player.Fullscreen />
              </div>
            )}
            {/* Add info for iOS PWA */}
            {isIOSPWA && (
              <div>
                <IosPwaLimitations />
              </div>
            )}
          </div>
        </div>
      </Player.BottomControls>

      <Player.VolumeChangedPopout />

      <Player.NextEpisodeButton
        controlsShowing={showTargets}
        onChange={props.onMetaChange}
      />
    </Player.Container>
  );
}
