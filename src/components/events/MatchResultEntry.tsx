import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchResultEntryProps {
  eventId: string;
  matchResult: string | null;
  matchOutcome: 'win' | 'loss' | 'draw' | null;
  homeAway: 'home' | 'away' | 'neutral' | null;
  canEdit: boolean;
  teamName?: string;
  opponentName?: string;
  onSave: (eventId: string, data: { match_result: string; match_outcome: string }) => Promise<boolean>;
}

export const MatchResultEntry = ({
  eventId,
  matchResult,
  matchOutcome,
  homeAway,
  canEdit,
  teamName,
  opponentName,
  onSave,
}: MatchResultEntryProps) => {
  const { t } = useTranslation('events');
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [saving, setSaving] = useState(false);

  const computeOutcome = (home: number, away: number): 'win' | 'loss' | 'draw' => {
    if (home === away) return 'draw';
    const isHome = homeAway !== 'away';
    if (isHome) return home > away ? 'win' : 'loss';
    return away > home ? 'win' : 'loss';
  };

  const handleSubmit = async () => {
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

    setSaving(true);
    const outcome = computeOutcome(h, a);
    const result = `${h} - ${a}`;

    const success = await onSave(eventId, {
      match_result: result,
      match_outcome: outcome,
    });

    if (success) {
      const toastMessages: Record<string, { title: string; desc: string }> = {
        win: { title: t('result.winToast', 'Great win! 🎉'), desc: result },
        loss: { title: t('result.lossToast', 'Keep going! 💪'), desc: result },
        draw: { title: t('result.drawToast', 'Close game!'), desc: result },
      };
      toast({ title: toastMessages[outcome].title, description: toastMessages[outcome].desc });
    }
    setSaving(false);
  };

  const outcomeBadge = matchOutcome ? (
    <Badge
      variant="outline"
      className={
        matchOutcome === 'win'
          ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
          : matchOutcome === 'loss'
          ? 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
          : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
      }
    >
      {matchOutcome === 'win' && t('result.win', 'Win')}
      {matchOutcome === 'loss' && t('result.loss', 'Loss')}
      {matchOutcome === 'draw' && t('result.draw', 'Draw')}
    </Badge>
  ) : null;

  // Display existing result
  if (matchResult) {
    return (
      <div className="flex items-center gap-3 pt-1">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{t('details.matchResult', 'Result')}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-foreground">{matchResult}</p>
            {outcomeBadge}
          </div>
        </div>
      </div>
    );
  }

  // Editable score entry
  if (canEdit) {
    const homeLabel = homeAway === 'away' ? (opponentName || t('result.opponent', 'Opponent')) : (teamName || t('result.yourTeam', 'Your Team'));
    const awayLabel = homeAway === 'away' ? (teamName || t('result.yourTeam', 'Your Team')) : (opponentName || t('result.opponent', 'Opponent'));

    return (
      <div className="flex items-center gap-3 pt-1">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-xs text-muted-foreground">{t('details.matchResult', 'Result')}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground truncate mb-1">{homeLabel}</p>
              <Input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="text-center text-lg font-bold h-10"
                placeholder="0"
              />
            </div>
            <span className="text-muted-foreground font-bold text-lg mt-4">-</span>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground truncate mb-1">{awayLabel}</p>
              <Input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="text-center text-lg font-bold h-10"
                placeholder="0"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={saving || homeScore === '' || awayScore === ''}
              className="mt-4"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Non-editable, no result yet
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Trophy className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{t('details.matchResult', 'Result')}</p>
        <p className="text-sm text-muted-foreground">{t('details.noResult', 'No result yet')}</p>
      </div>
    </div>
  );
};
