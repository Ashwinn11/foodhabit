import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { user_id } = await req.json();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
        const today = now.toISOString().split('T')[0];

        // Get last 7 days of symptom logs
        const { data: symptomLogs } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('logged_at', sevenDaysAgo)
            .order('logged_at', { ascending: false });

        if (!symptomLogs || symptomLogs.length === 0) {
            return new Response(JSON.stringify({ message: 'Not enough symptom data' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Calculate 7-day averages
        const avgBloating = symptomLogs.reduce((sum: number, l: any) => sum + l.bloating, 0) / symptomLogs.length;
        const avgPain = symptomLogs.reduce((sum: number, l: any) => sum + l.pain, 0) / symptomLogs.length;
        const avgUrgency = symptomLogs.reduce((sum: number, l: any) => sum + l.urgency, 0) / symptomLogs.length;
        const avgFatigue = symptomLogs.reduce((sum: number, l: any) => sum + l.fatigue, 0) / symptomLogs.length;

        // Good/bad days
        let goodDays = 0;
        let badDays = 0;
        const dayMap: Record<string, any[]> = {};

        symptomLogs.forEach((log: any) => {
            const day = log.logged_at.split('T')[0];
            if (!dayMap[day]) dayMap[day] = [];
            dayMap[day].push(log);
        });

        Object.values(dayMap).forEach((logs: any[]) => {
            let maxSymptomOfDay = 0;

            logs.forEach(l => {
                const maxInLog = Math.max(l.bloating, l.pain, l.urgency, l.nausea, l.fatigue);
                if (maxInLog > maxSymptomOfDay) {
                    maxSymptomOfDay = maxInLog;
                }
            });

            if (maxSymptomOfDay >= 6) badDays++;
            else if (maxSymptomOfDay <= 3) goodDays++;
        });

        // Get confirmed triggers
        const { data: triggerInsights } = await supabase
            .from('ai_insights')
            .select('related_foods')
            .eq('user_id', user_id)
            .in('insight_type', ['trigger_confirmed', 'trigger_likely'])
            .limit(10);

        const topTriggers = [...new Set(
            (triggerInsights || []).flatMap((i: any) => i.related_foods || [])
        )].slice(0, 5);

        // Calculate improvement: compare current 7d avg vs first-ever 7d avg
        const { data: oldestSnapshots } = await supabase
            .from('progress_snapshots')
            .select('avg_bloating_7d, avg_pain_7d, avg_urgency_7d, avg_fatigue_7d')
            .eq('user_id', user_id)
            .order('snapshot_date', { ascending: true })
            .limit(1);

        let improvement = 0;
        if (oldestSnapshots && oldestSnapshots.length > 0) {
            const oldAvg = (
                Number(oldestSnapshots[0].avg_bloating_7d) +
                Number(oldestSnapshots[0].avg_pain_7d) +
                Number(oldestSnapshots[0].avg_urgency_7d) +
                Number(oldestSnapshots[0].avg_fatigue_7d)
            ) / 4;

            const currentAvg = (avgBloating + avgPain + avgUrgency + avgFatigue) / 4;

            if (oldAvg > 0) {
                improvement = Math.round(((oldAvg - currentAvg) / oldAvg) * 100);
            }
        }

        // Upsert progress snapshot
        const { error: upsertError } = await supabase
            .from('progress_snapshots')
            .upsert({
                user_id,
                snapshot_date: today,
                avg_bloating_7d: Math.round(avgBloating * 10) / 10,
                avg_pain_7d: Math.round(avgPain * 10) / 10,
                avg_urgency_7d: Math.round(avgUrgency * 10) / 10,
                avg_fatigue_7d: Math.round(avgFatigue * 10) / 10,
                good_days_count: goodDays,
                bad_days_count: badDays,
                top_triggers: topTriggers,
                improvement_vs_baseline: improvement,
            }, { onConflict: 'user_id,snapshot_date' } as any);

        if (upsertError) {
            // Fallback: insert instead
            await supabase.from('progress_snapshots').insert({
                user_id,
                snapshot_date: today,
                avg_bloating_7d: Math.round(avgBloating * 10) / 10,
                avg_pain_7d: Math.round(avgPain * 10) / 10,
                avg_urgency_7d: Math.round(avgUrgency * 10) / 10,
                avg_fatigue_7d: Math.round(avgFatigue * 10) / 10,
                good_days_count: goodDays,
                bad_days_count: badDays,
                top_triggers: topTriggers,
                improvement_vs_baseline: improvement,
            });
        }

        return new Response(JSON.stringify({
            avg_bloating_7d: avgBloating,
            avg_pain_7d: avgPain,
            avg_urgency_7d: avgUrgency,
            avg_fatigue_7d: avgFatigue,
            good_days_count: goodDays,
            bad_days_count: badDays,
            top_triggers: topTriggers,
            improvement_vs_baseline: improvement,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});
