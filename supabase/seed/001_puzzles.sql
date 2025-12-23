-- Seed puzzles for branching EQ mechanic
INSERT INTO puzzles (
  id,
  category,
  context,
  message,
  rounds,
  reveal,
  is_daily,
  daily_date,
  is_active
) VALUES
  (
    'workplace-subtle-promotion',
    'Workplace Politics',
    $$In a team meeting, the project lead role is open and your manager asks for suggestions.$$,
    $$I think Sarah would be great at leading this project, but I'm happy to help however I can.$$,
    $$[
      {"id":"r1","question":"What is the strategic move in this line?","options":[{"key":"genuine_endorsement","label":"Genuine endorsement of Sarah"},{"key":"neutral_peace","label":"Neutral support to avoid conflict"},{"key":"position_self","label":"Positioning themselves as the obvious alternative"}],"correct_key":"position_self"},
      {"id":"r2","question":"Where is the pressure aimed?","options":[{"key":"upward_manager","label":"Upward at the manager"},{"key":"sideways_sarah","label":"Sideways at Sarah"},{"key":"downward_team","label":"Downward at the team"}],"correct_key":"upward_manager"},
      {"id":"r3","question":"What outcome are they hoping for?","options":[{"key":"give_them_lead","label":"You give them the lead"},{"key":"co_lead_offer","label":"You offer them co-lead with Sarah"},{"key":"postpone_choice","label":"You postpone the decision"}],"correct_key":"give_them_lead"}
    ]$$::jsonb,
    $$
      {"truth":"Subtle self-promotion masked as support for Sarah.","explanation":"By endorsing Sarah then offering help, they signal they are ready to lead without openly campaigning.","pattern":"Watch for praise that positions the speaker as the safe fallback choice."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'workplace-budget-deferral',
    'Workplace Politics',
    $$You ask your manager for an extra headcount during a budget review.$$,
    $$Let's revisit Q2 budgets later.$$,
    $$[
      {"id":"r1","question":"Is this a delay or a soft no?","options":[{"key":"genuine_timing","label":"Genuine timing issue"},{"key":"soft_no","label":"Soft no to avoid conflict"},{"key":"need_data","label":"They need more data from you"}],"correct_key":"soft_no"},
      {"id":"r2","question":"What priority signal is embedded?","options":[{"key":"not_urgent","label":"Your request is not urgent"},{"key":"build_case","label":"You should build a stronger case"},{"key":"waiting_finance","label":"They are waiting on finance approval"}],"correct_key":"not_urgent"},
      {"id":"r3","question":"What are they hoping you do next?","options":[{"key":"drop_quietly","label":"Let it drop for now"},{"key":"send_roi_brief","label":"Send a short ROI note"},{"key":"escalate_publicly","label":"Raise it in a public forum"}],"correct_key":"drop_quietly"}
    ]$$::jsonb,
    $$
      {"truth":"A polite deflection, not a real plan to revisit.","explanation":"Revisit later signals low priority and a desire to avoid a direct no.","pattern":"Soft deferrals often mean the request is effectively declined."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'workplace-meeting-notes',
    'Workplace Politics',
    $$You are presenting a proposal in a cross-team meeting and a senior peer jumps in.$$,
    $$Happy to take notes if that helps.$$,
    $$[
      {"id":"r1","question":"What is the hidden move here?","options":[{"key":"pure_support","label":"Purely supportive"},{"key":"control_record","label":"Trying to control the record"},{"key":"avoid_speaking","label":"Avoiding speaking"}],"correct_key":"control_record"},
      {"id":"r2","question":"What does controlling the notes buy them?","options":[{"key":"shape_summary","label":"Shape the official summary"},{"key":"protect_you","label":"Protect you from questions"},{"key":"manage_time","label":"Keep the meeting on schedule"}],"correct_key":"shape_summary"},
      {"id":"r3","question":"What outcome are they angling for?","options":[{"key":"public_credit","label":"Public credit for organization"},{"key":"silent_role","label":"A quiet role with low risk"},{"key":"ease_pressure","label":"To put you at ease"}],"correct_key":"public_credit"}
    ]$$::jsonb,
    $$
      {"truth":"They want to own the narrative and the credit.","explanation":"Taking notes lets them frame the takeaway and position themselves as the organizer.","pattern":"Control of documentation often equals control of perception."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'dating-standup-2025-12-23',
    'Dating & Romance',
    $$You were supposed to meet for dinner. You waited 45 minutes, then they text.$$,
    $$I'm fine, really. No big deal.$$,
    $$[
      {"id":"r1","question":"Are they saying what they feel?","options":[{"key":"genuine_ok","label":"Yes, they are fine"},{"key":"hurt_underneath","label":"No, there is hurt underneath"},{"key":"teasing","label":"They are teasing"}],"correct_key":"hurt_underneath"},
      {"id":"r2","question":"Where is the hurt aimed?","options":[{"key":"at_you","label":"At you for letting them down"},{"key":"at_self","label":"At themselves for caring"},{"key":"at_circumstances","label":"At the situation"}],"correct_key":"at_you"},
      {"id":"r3","question":"What do they want now?","options":[{"key":"space_and_silence","label":"Space and no follow-up"},{"key":"sincere_apology","label":"A sincere apology and effort"},{"key":"end_things","label":"To end things quietly"}],"correct_key":"sincere_apology"}
    ]$$::jsonb,
    $$
      {"truth":"They are hurt and want you to notice and repair it.","explanation":"I am fine is a cover for disappointment and a wish for a real apology.","pattern":"After a letdown, minimization often masks a desire for repair."}
    $$::jsonb,
    true,
    '2025-12-23',
    true
  ),
  (
    'dating-busy-week',
    'Dating & Romance',
    $$You went on a good first date and text the next morning to set up a second.$$,
    $$Had a great time last night! Busy week ahead though.$$,
    $$[
      {"id":"r1","question":"What is the likely intent?","options":[{"key":"eager_to_book","label":"Eager to book another date"},{"key":"soft_fade","label":"A polite fade"},{"key":"testing_interest","label":"Testing how hard you will chase"}],"correct_key":"soft_fade"},
      {"id":"r2","question":"What is the signal about availability?","options":[{"key":"low_priority","label":"You are a low priority"},{"key":"schedule_conflict","label":"They are truly slammed this week"},{"key":"wants_you_to_chase","label":"They want you to push harder"}],"correct_key":"low_priority"},
      {"id":"r3","question":"What are they hoping you do?","options":[{"key":"back_off_gracefully","label":"Back off gracefully"},{"key":"double_text","label":"Double text to keep it alive"},{"key":"lock_specific_date","label":"Lock a specific date now"}],"correct_key":"back_off_gracefully"}
    ]$$::jsonb,
    $$
      {"truth":"A soft fade disguised as busy timing.","explanation":"The praise eases the letdown while busy creates distance without a direct no.","pattern":"Compliments paired with vague unavailability usually mean low intent."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'dating-cancel-plans',
    'Dating & Romance',
    $$You cancel dinner with your partner last minute to go out with friends.$$,
    $$It's okay, go out with them.$$,
    $$[
      {"id":"r1","question":"Is the permission sincere?","options":[{"key":"sincere","label":"Yes, they are happy for you"},{"key":"sidelined","label":"No, they feel sidelined"},{"key":"indifferent","label":"They do not care"}],"correct_key":"sidelined"},
      {"id":"r2","question":"What is driving the reaction?","options":[{"key":"last_minute_disrespect","label":"Feeling disrespected by the last minute change"},{"key":"jealousy","label":"Jealousy of your friends"},{"key":"fear_of_needing","label":"Fear of seeming needy"}],"correct_key":"last_minute_disrespect"},
      {"id":"r3","question":"What do they want from you?","options":[{"key":"acknowledge_and_reschedule","label":"Acknowledge it and reschedule"},{"key":"stop_asking","label":"Stop asking for permission"},{"key":"stay_home","label":"Cancel your plans and stay home"}],"correct_key":"acknowledge_and_reschedule"}
    ]$$::jsonb,
    $$
      {"truth":"They feel pushed aside and want you to make it right.","explanation":"The calm permission hides disappointment about being bumped.","pattern":"Low-drama replies can conceal a request for repair."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'family-startup-worry',
    'Family Dynamics',
    $$You tell your parent you are leaving a stable job for a startup.$$,
    $$We just want what's best for you.$$,
    $$[
      {"id":"r1","question":"What is underneath this line?","options":[{"key":"pure_support","label":"Pure support"},{"key":"anxiety_security","label":"Anxiety about security"},{"key":"disappointment","label":"Disappointment in your choice"}],"correct_key":"anxiety_security"},
      {"id":"r2","question":"Where is the anxiety pointed?","options":[{"key":"your_judgment","label":"At your judgment"},{"key":"the_economy","label":"At the economy"},{"key":"their_reputation","label":"At their reputation"}],"correct_key":"your_judgment"},
      {"id":"r3","question":"What do they want from you?","options":[{"key":"plan_reassurance","label":"A concrete plan and reassurance"},{"key":"abandon_idea","label":"You to drop the idea"},{"key":"stop_sharing","label":"You to stop sharing details"}],"correct_key":"plan_reassurance"}
    ]$$::jsonb,
    $$
      {"truth":"A worry response framed as care.","explanation":"Best for you is code for fear about stability and your judgment.","pattern":"Concern language often signals anxiety more than disapproval."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'family-weekend-jab',
    'Family Dynamics',
    $$You say you are exhausted after a light week, and your sibling with kids replies.$$,
    $$Must be nice to have free weekends.$$,
    $$[
      {"id":"r1","question":"How should you read this?","options":[{"key":"playful_envy","label":"Playful envy"},{"key":"resentful_jab","label":"A resentful jab"},{"key":"neutral_comment","label":"A neutral comment"}],"correct_key":"resentful_jab"},
      {"id":"r2","question":"What is the resentment about?","options":[{"key":"unequal_load","label":"Unequal load of responsibilities"},{"key":"your_success","label":"Your recent success"},{"key":"lack_of_rest","label":"Their lack of rest"}],"correct_key":"lack_of_rest"},
      {"id":"r3","question":"What do they want?","options":[{"key":"offer_help","label":"You to offer practical help"},{"key":"stop_complaining","label":"You to stop complaining"},{"key":"praise_them","label":"You to praise them"}],"correct_key":"offer_help"}
    ]$$::jsonb,
    $$
      {"truth":"They are overloaded and want recognition or help.","explanation":"The jab is about their exhaustion, not your choices.","pattern":"Resentment often points to unmet needs, not a desire to fight."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'family-bring-nothing',
    'Family Dynamics',
    $$You forgot to bring anything to the last family dinner. This time the host says:$$,
    $$You don't need to bring anything.$$,
    $$[
      {"id":"r1","question":"Literal or social cue?","options":[{"key":"literal","label":"Literal, bring nothing"},{"key":"test_thoughtfulness","label":"A test of thoughtfulness"},{"key":"upset_space","label":"They are upset and want space"}],"correct_key":"test_thoughtfulness"},
      {"id":"r2","question":"What are they really checking for?","options":[{"key":"remember_them","label":"Whether you remember them"},{"key":"cooking_skill","label":"Whether you can cook"},{"key":"punctuality","label":"Whether you show up early"}],"correct_key":"remember_them"},
      {"id":"r3","question":"What is the safe read?","options":[{"key":"bring_small_item","label":"Bring a small thoughtful item"},{"key":"bring_nothing","label":"Bring nothing at all"},{"key":"cancel","label":"Cancel to avoid tension"}],"correct_key":"bring_small_item"}
    ]$$::jsonb,
    $$
      {"truth":"They want a gesture, even if they say no.","explanation":"This is a polite cue for thoughtfulness after last time.","pattern":"In family settings, a small effort often matters even when it is declined."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'conflict-take-offline',
    'Conflict Resolution',
    $$In a project meeting you challenge a plan. A teammate responds:$$,
    $$Let's take this offline.$$,
    $$[
      {"id":"r1","question":"What is the immediate goal?","options":[{"key":"deescalate_save_face","label":"De-escalate and save face"},{"key":"shut_you_down","label":"Silence you"},{"key":"protect_time","label":"Protect the agenda"}],"correct_key":"deescalate_save_face"},
      {"id":"r2","question":"Why now?","options":[{"key":"feel_exposed","label":"They feel exposed"},{"key":"need_more_data","label":"They need more data"},{"key":"respect_expertise","label":"They respect your expertise"}],"correct_key":"feel_exposed"},
      {"id":"r3","question":"What do they want next?","options":[{"key":"private_alignment","label":"A private discussion to align"},{"key":"drop_issue","label":"You to drop the issue"},{"key":"hr_involvement","label":"Escalation to HR"}],"correct_key":"private_alignment"}
    ]$$::jsonb,
    $$
      {"truth":"A face-saving pause, not a shutdown.","explanation":"They want to avoid public conflict and reset the conversation in private.","pattern":"Offline cues a preference for controlled, private resolution."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'conflict-nothing-big',
    'Conflict Resolution',
    $$After a tense exchange, your friend texts:$$,
    $$Can we talk? Nothing big.$$,
    $$[
      {"id":"r1","question":"What is the phrase nothing big doing?","options":[{"key":"make_safer","label":"Making it feel safer"},{"key":"truly_small","label":"It is truly minor"},{"key":"avoid_responsibility","label":"Avoiding responsibility"}],"correct_key":"make_safer"},
      {"id":"r2","question":"Likely focus of the talk?","options":[{"key":"repair_feelings","label":"Repairing feelings"},{"key":"ask_favor","label":"Asking for a favor"},{"key":"change_subject","label":"Changing the subject"}],"correct_key":"repair_feelings"},
      {"id":"r3","question":"What do they want from you?","options":[{"key":"listen_openly","label":"Listen without defensiveness"},{"key":"immediate_apology","label":"An immediate apology only"},{"key":"end_friendship","label":"To end the friendship"}],"correct_key":"listen_openly"}
    ]$$::jsonb,
    $$
      {"truth":"A gentle attempt to repair the relationship.","explanation":"Nothing big lowers the stakes so you will engage instead of brace.","pattern":"Softening language often signals care about the relationship."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'conflict-noise-dismissal',
    'Conflict Resolution',
    $$You ask your neighbor to keep music down at night. They reply:$$,
    $$I'll keep the noise down, no worries.$$,
    $$[
      {"id":"r1","question":"Is that acceptance or dismissal?","options":[{"key":"genuine_compliance","label":"Genuine compliance"},{"key":"polite_dismissal","label":"Polite dismissal"},{"key":"passive_threat","label":"Passive aggressive warning"}],"correct_key":"polite_dismissal"},
      {"id":"r2","question":"What does that imply about future behavior?","options":[{"key":"no_change","label":"No real change"},{"key":"short_term_change","label":"A short-term change only"},{"key":"long_term_change","label":"Long-term change"}],"correct_key":"no_change"},
      {"id":"r3","question":"What are they hoping you do?","options":[{"key":"drop_issue","label":"Drop the issue"},{"key":"give_specific_times","label":"Give specific quiet hours"},{"key":"apologize_for_asking","label":"Apologize for asking"}],"correct_key":"drop_issue"}
    ]$$::jsonb,
    $$
      {"truth":"A polite brush-off that signals low intention to change.","explanation":"No worries can be a shield to end the conversation, not a promise.","pattern":"Smooth replies can conceal resistance to the request."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'etiquette-late-arrival',
    'Social Etiquette',
    $$You arrive 30 minutes late to a dinner party.$$,
    $$Don't worry about being late.$$,
    $$[
      {"id":"r1","question":"How to read this?","options":[{"key":"truly_fine","label":"They truly do not mind"},{"key":"annoyed_polite","label":"They are annoyed but polite"},{"key":"forgot_start","label":"They forgot the start time"}],"correct_key":"annoyed_polite"},
      {"id":"r2","question":"What is expected of you?","options":[{"key":"quick_apology","label":"A quick apology and move on"},{"key":"long_excuse","label":"A detailed excuse"},{"key":"offer_leave","label":"Offer to leave"}],"correct_key":"quick_apology"},
      {"id":"r3","question":"What do they want from you now?","options":[{"key":"join_in","label":"Join in and be present"},{"key":"help_kitchen","label":"Stay in the kitchen to help"},{"key":"keep_apologizing","label":"Keep apologizing"}],"correct_key":"join_in"}
    ]$$::jsonb,
    $$
      {"truth":"Polite smoothing, not a reset.","explanation":"They want a brief apology and for you to participate without making it about the lateness.","pattern":"Social forgiveness often comes with a cue to move on."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'etiquette-no-thanks',
    'Social Etiquette',
    $$A coworker covers your shift last minute in front of your boss and says:$$,
    $$No need to thank me.$$,
    $$[
      {"id":"r1","question":"What is the subtext?","options":[{"key":"private_humility","label":"Private humility"},{"key":"public_performance","label":"Public performance"},{"key":"hidden_resentment","label":"Hidden resentment"}],"correct_key":"public_performance"},
      {"id":"r2","question":"Who is the audience?","options":[{"key":"boss","label":"The boss"},{"key":"you","label":"You"},{"key":"team","label":"The team"}],"correct_key":"boss"},
      {"id":"r3","question":"What do they want?","options":[{"key":"public_credit_later","label":"Public credit later"},{"key":"personal_apology","label":"A personal apology"},{"key":"nothing","label":"Nothing at all"}],"correct_key":"public_credit_later"}
    ]$$::jsonb,
    $$
      {"truth":"They are signaling generosity to someone who can reward it.","explanation":"The line performs humility while directing the boss to notice the favor.","pattern":"Public humility can be a bid for public credit."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'etiquette-whatever',
    'Social Etiquette',
    $$In a group chat planning dinner, a friend who usually has strong preferences says:$$,
    $$I'm fine with whatever.$$,
    $$[
      {"id":"r1","question":"What is the likely meaning?","options":[{"key":"genuinely_flexible","label":"They are genuinely flexible"},{"key":"avoiding_conflict","label":"They are avoiding conflict"},{"key":"passive_control","label":"They are trying to steer without saying"}],"correct_key":"avoiding_conflict"},
      {"id":"r2","question":"If you pick wrong, what happens?","options":[{"key":"quiet_disappointment","label":"Quiet disappointment later"},{"key":"speak_up","label":"They will speak up immediately"},{"key":"cancel","label":"They will cancel"}],"correct_key":"quiet_disappointment"},
      {"id":"r3","question":"What do they want from you?","options":[{"key":"offer_choices","label":"Offer a few options and ask directly"},{"key":"decide_fast","label":"Decide fast and move on"},{"key":"make_them_choose","label":"Force them to choose"}],"correct_key":"offer_choices"}
    ]$$::jsonb,
    $$
      {"truth":"A conflict-avoidant preference, not true flexibility.","explanation":"Whatever hides their wants to keep harmony.","pattern":"When someone often has preferences, neutrality can be protective rather than real."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'anger-not-mad',
    'Anger Management',
    $$You forgot a chore and your partner gives one-word replies.$$,
    $$I'm not mad.$$,
    $$[
      {"id":"r1","question":"What is the real state?","options":[{"key":"actually_fine","label":"They are actually fine"},{"key":"upset_suppressing","label":"They are upset but suppressing it"},{"key":"amused","label":"They are amused"}],"correct_key":"upset_suppressing"},
      {"id":"r2","question":"Why suppress it?","options":[{"key":"avoid_fight","label":"They want to avoid a fight"},{"key":"wont_change","label":"They think you will not change"},{"key":"testing_you","label":"They are testing you"}],"correct_key":"avoid_fight"},
      {"id":"r3","question":"What do they need?","options":[{"key":"acknowledge_repair","label":"Acknowledge it and repair"},{"key":"leave_alone","label":"Leave them alone"},{"key":"explain_side","label":"Explain your side in detail"}],"correct_key":"acknowledge_repair"}
    ]$$::jsonb,
    $$
      {"truth":"Suppressed anger that needs acknowledgment.","explanation":"Short replies plus not mad often signals upset without wanting escalation.","pattern":"Low emotional bandwidth can hide active frustration."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'anger-just-helping',
    'Anger Management',
    $$A coworker keeps correcting you in meetings; you ask them to stop. They reply:$$,
    $$I'm just trying to help.$$,
    $$[
      {"id":"r1","question":"What is underneath this phrase?","options":[{"key":"defensive_justification","label":"Defensive justification"},{"key":"genuine_confusion","label":"Genuine confusion"},{"key":"mocking","label":"Mocking you"}],"correct_key":"defensive_justification"},
      {"id":"r2","question":"What are they protecting?","options":[{"key":"helper_identity","label":"Their identity as helpful"},{"key":"authority_over_you","label":"Their authority over you"},{"key":"their_time","label":"Their time"}],"correct_key":"helper_identity"},
      {"id":"r3","question":"What do they want now?","options":[{"key":"validation_of_intent","label":"Validation of their intent"},{"key":"keep_advising","label":"Permission to keep advising"},{"key":"drop_it","label":"To drop the topic"}],"correct_key":"validation_of_intent"}
    ]$$::jsonb,
    $$
      {"truth":"They are defending their self-image, not your needs.","explanation":"Trying to help shifts focus to their intent so they feel justified.","pattern":"Defensiveness often seeks validation more than resolution."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'sarcasm-finally-showed',
    'Sarcasm Detection',
    $$You arrive late to meet friends.$$,
    $$Wow, look who finally showed up.$$,
    $$[
      {"id":"r1","question":"Literal or sarcastic?","options":[{"key":"sarcastic_jab","label":"Sarcastic jab"},{"key":"genuine_surprise","label":"Genuine surprise"},{"key":"warm_greeting","label":"Warm greeting"}],"correct_key":"sarcastic_jab"},
      {"id":"r2","question":"Underlying emotion?","options":[{"key":"annoyance","label":"Annoyance"},{"key":"jealousy","label":"Jealousy"},{"key":"confusion","label":"Confusion"}],"correct_key":"annoyance"},
      {"id":"r3","question":"What do they want from you?","options":[{"key":"acknowledge_lateness","label":"Acknowledge you are late"},{"key":"defend_self","label":"Defend yourself"},{"key":"ignore_it","label":"Ignore it and move on"}],"correct_key":"acknowledge_lateness"}
    ]$$::jsonb,
    $$
      {"truth":"A sarcastic poke about lateness.","explanation":"The joke is a mild complaint asking for recognition of the delay.","pattern":"Sarcasm often hides a request for accountability."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'sarcasm-quick-fix',
    'Sarcasm Detection',
    $$A fix you promised for yesterday ships late, and a coworker says:$$,
    $$Great job on the 'quick' fix.$$,
    $$[
      {"id":"r1","question":"How to read the quote marks?","options":[{"key":"sincere_praise","label":"Sincere praise"},{"key":"sarcastic_critique","label":"Sarcastic critique"},{"key":"neutral_observation","label":"Neutral observation"}],"correct_key":"sarcastic_critique"},
      {"id":"r2","question":"What are they frustrated about?","options":[{"key":"timeline_impact","label":"Timeline impact"},{"key":"technical_quality","label":"Technical quality"},{"key":"customer_feedback","label":"Customer feedback"}],"correct_key":"timeline_impact"},
      {"id":"r3","question":"What would reduce tension?","options":[{"key":"own_delay_update","label":"Own the delay and update the plan"},{"key":"joke_back","label":"Make a joke back"},{"key":"blame_other","label":"Blame another team"}],"correct_key":"own_delay_update"}
    ]$$::jsonb,
    $$
      {"truth":"Sarcastic criticism of the delay.","explanation":"Quote marks signal frustration about missed timing, not the code itself.","pattern":"Sarcasm often flags a process miss more than a personal attack."}
    $$::jsonb,
    false,
    null,
    true
  ),
  (
    'sarcasm-take-your-time',
    'Sarcasm Detection',
    $$Your parent is waiting in the car after you said you would be out in five minutes.$$,
    $$Sure, take your time.$$,
    $$[
      {"id":"r1","question":"Tone?","options":[{"key":"sincere_patience","label":"Sincere patience"},{"key":"irritated_sarcasm","label":"Irritated sarcasm"},{"key":"indifference","label":"Indifference"}],"correct_key":"irritated_sarcasm"},
      {"id":"r2","question":"Underlying ask?","options":[{"key":"better_communication","label":"Better communication"},{"key":"cancel_plans","label":"Cancel the plans"},{"key":"visit_more","label":"Visit more often"}],"correct_key":"better_communication"},
      {"id":"r3","question":"What do they want now?","options":[{"key":"apology_eta","label":"An apology and a clear ETA"},{"key":"silence","label":"Silence"},{"key":"gift","label":"A gift"}],"correct_key":"apology_eta"}
    ]$$::jsonb,
    $$
      {"truth":"Annoyed sarcasm asking for respect of their time.","explanation":"Take your time actually means please communicate and hurry.","pattern":"Sarcasm can be a polite cover for irritation."}
    $$::jsonb,
    false,
    null,
    true
  );
