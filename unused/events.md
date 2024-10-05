# Telegraf.js Events

هذا الملف يوضح جميع الأحداث (filters) الممكنة في Telegraf.js التي يمكن استخدامها مع `.on`. يتم استخدام هذه الأحداث لمعالجة مختلف أنواع التحديثات التي تصل للبوت من خلال Telegram API. يمكن للبوت التفاعل مع هذه الأحداث بناءً على نوع الرسالة أو التفاعل الذي يحدث في المحادثة.

## قائمة الأحداث المتاحة

1. **text**: عند استقبال رسالة نصية عادية.
2. **sticker**: عند استقبال ستيكر (ملصق).
3. **animation**: عند استقبال أنيميشن (مثل GIF).
4. **audio**: عند استقبال ملف صوتي.
5. **document**: عند استقبال مستند (مثل PDF).
6. **photo**: عند استقبال صورة.
7. **video**: عند استقبال فيديو.
8. **video_note**: عند استقبال رسالة فيديو (دائرية).
9. **voice**: عند استقبال رسالة صوتية (Voice message).
10. **callback_query**: عند تفاعل المستخدم مع زر inline button.
11. **channel_post**: عند نشر رسالة في قناة يديرها البوت.
12. **chat_member**: عند تحديث حالة عضو في المحادثة.
13. **chosen_inline_result**: عند اختيار نتيجة inline من المستخدم.
14. **edited_channel_post**: عند تعديل رسالة منشورة في قناة.
15. **message_reaction**: عند تفاعل المستخدم مع رسالة (ردود الفعل).
16. **message_reaction_count**: عدد ردود الفعل التي تم تطبيقها على الرسالة.
17. **edited_message**: عند تعديل رسالة في المحادثة.
18. **inline_query**: عند إجراء استعلام inline من المستخدم.
19. **message**: فلتر عام لجميع أنواع الرسائل.
20. **my_chat_member**: عند تحديث حالة البوت في محادثة.
21. **pre_checkout_query**: عند مراجعة تفاصيل الدفع قبل الإتمام.
22. **poll_answer**: عند إجابة المستخدم على استبيان.
23. **poll**: عند إنشاء استبيان جديد.
24. **shipping_query**: عند إدخال تفاصيل الشحن.
25. **chat_join_request**: عند طلب المستخدم الانضمام لمجموعة أو قناة.
26. **chat_boost**: عند تحسين المحادثة (ميزة جديدة).
27. **removed_chat_boost**: عند إزالة تحسين المحادثة.
28. **has_media_spoiler**: عند احتواء وسائط على تحذير محتوى مخفي.
29. **contact**: عند مشاركة المستخدم لجهة اتصال.
30. **dice**: عند إرسال رمز النرد (Dice).
31. **location**: عند مشاركة الموقع.
32. **new_chat_members**: عند انضمام أعضاء جدد للمحادثة.
33. **left_chat_member**: عند مغادرة عضو للمحادثة.
34. **new_chat_title**: عند تغيير عنوان المحادثة.
35. **new_chat_photo**: عند تغيير صورة المحادثة.
36. **delete_chat_photo**: عند حذف صورة المحادثة.
37. **group_chat_created**: عند إنشاء مجموعة.
38. **supergroup_chat_created**: عند ترقية مجموعة إلى Supergroup.
39. **channel_chat_created**: عند إنشاء قناة.
40. **message_auto_delete_timer_changed**: عند تغيير مؤقت حذف الرسائل التلقائي.
41. **migrate_to_chat_id**: عند نقل مجموعة إلى Supergroup.
42. **migrate_from_chat_id**: عند نقل مجموعة من Supergroup.
43. **pinned_message**: عند تثبيت رسالة في المحادثة.
44. **invoice**: عند إرسال فاتورة.
45. **successful_payment**: عند إتمام عملية دفع بنجاح.
46. **users_shared**: عند مشاركة المستخدم معلومات مستخدمين آخرين.
47. **chat_shared**: عند مشاركة المستخدم تفاصيل محادثة.
48. **connected_website**: عند الإشارة إلى موقع متصل في الرسالة.
49. **write_access_allowed**: عند منح حق الوصول للكتابة في المحادثة.
50. **passport_data**: عند مشاركة بيانات جواز السفر.
51. **proximity_alert_triggered**: عند تفعيل تنبيه القرب باستخدام GPS.
52. **boost_added**: عند إضافة تحسين للمحادثة.
53. **forum_topic_created**: عند إنشاء موضوع منتدى جديد.
54. **forum_topic_edited**: عند تعديل موضوع المنتدى.
55. **forum_topic_closed**: عند إغلاق موضوع المنتدى.
56. **forum_topic_reopened**: عند إعادة فتح موضوع المنتدى.
57. **general_forum_topic_hidden**: عند إخفاء موضوع المنتدى العام.
58. **general_forum_topic_unhidden**: عند إظهار موضوع المنتدى العام.
59. **giveaway_created**: عند إنشاء "سحب جوائز".
60. **giveaway**: عند تشغيل "سحب جوائز".
61. **giveaway_winners**: عند اختيار فائزين في "سحب جوائز".
62. **giveaway_completed**: عند انتهاء "سحب الجوائز".
63. **video_chat_scheduled**: عند جدولة مكالمة فيديو.
64. **video_chat_started**: عند بدء مكالمة فيديو.
65. **video_chat_ended**: عند انتهاء مكالمة فيديو.
66. **video_chat_participants_invited**: عند دعوة مشاركين لمكالمة فيديو.
67. **web_app_data**: عند مشاركة بيانات من تطبيق ويب.
68. **game**: عند مشاركة لعبة.
69. **story**: عند مشاركة قصة (مثل Instagram Stories).
70. **venue**: عند مشاركة مكان.
71. **forward_date**: عند إعادة توجيه رسالة من محادثة أخرى.

## مثال على الاستخدام

إليك كيفية التعامل مع هذه الأحداث باستخدام `client.on` في Telegraf.js:

```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf('BOT_TOKEN');

// الاستماع للأحداث المختلفة
bot.on('text', (ctx) => {
  ctx.reply('استلمت رسالة نصية');
});

bot.on('sticker', (ctx) => {
  ctx.reply('استلمت ستيكر!');
});

bot.on('photo', (ctx) => {
  ctx.reply('استلمت صورة!');
});

// الاستماع لردود الفعل
bot.on('message_reaction', (ctx) => {
  ctx.reply('تم تلقي ردة فعل على الرسالة!');
});

// بدء البوت
bot.launch();
