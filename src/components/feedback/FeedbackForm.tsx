import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bug, Lightbulb, HelpCircle, Star, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const feedbackSchema = z.object({
  category: z.enum(['bug', 'suggestion', 'question', 'praise']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'bug', icon: Bug, color: 'text-destructive' },
  { value: 'suggestion', icon: Lightbulb, color: 'text-yellow-500' },
  { value: 'question', icon: HelpCircle, color: 'text-blue-500' },
  { value: 'praise', icon: Star, color: 'text-green-500' },
] as const;

export function FeedbackForm({ open, onOpenChange }: FeedbackFormProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: undefined,
      message: '',
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('errors.unauthorized'),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        category: data.category,
        message: data.message,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;

      // Send email notification (fire-and-forget)
      supabase.functions.invoke('notify-feedback', {
        body: {
          category: data.category,
          message: data.message,
          userEmail: user.email,
          pageUrl: window.location.href,
        },
      }).catch((err) => console.error('Feedback notification error:', err));

      toast({
        title: t('feedback.success'),
        description: t('feedback.successDescription'),
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: t('feedback.error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('feedback.title')}</DialogTitle>
          <DialogDescription>{t('feedback.subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label>{t('feedback.category')}</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(({ value, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('category', value, { shouldValidate: true })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    'hover:border-primary/50 hover:bg-accent/50',
                    selectedCategory === value
                      ? 'border-primary bg-accent'
                      : 'border-border bg-background'
                  )}
                >
                  <Icon className={cn('h-6 w-6', color)} />
                  <span className="text-sm font-medium">
                    {t(`feedback.categories.${value}`)}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {t(`feedback.categoryDescriptions.${value}`)}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-sm text-destructive">{t('feedback.required')}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('feedback.message')}</Label>
            <Textarea
              id="message"
              placeholder={t('feedback.messagePlaceholder')}
              rows={4}
              {...register('message')}
              className={cn(errors.message && 'border-destructive')}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t('feedback.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
