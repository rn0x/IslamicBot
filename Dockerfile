# استخدام صورة رسمية لـ Node.js (نسخة حديثة)
FROM node:20-alpine

# إعداد المتغيرات البيئية للتأكد من عدم تشغيل البوت بامتيازات الجذر
ENV NODE_ENV=production

# تعيين مجلد العمل إلى جذر المشروع
WORKDIR /app

# نسخ ملفات package.json و package-lock.json لتثبيت التبعيات فقط إذا تغيرت
COPY package*.json ./

# تثبيت التبعيات باستخدام npm
RUN npm install

# نسخ بقية ملفات المشروع
COPY . .

# إعداد المجلدات التي قد يحتاج إليها البوت لكتابة بيانات مثل قواعد البيانات (database.db, session.db) والـ logs
VOLUME [ "/app/logs", "/app/database" ]

# تعيين المنفذ الذي يعمل عليه التطبيق (في حال كان البوت يستخدم منفذ معين)
#EXPOSE 3000

# الأوامر لتشغيل البوت
CMD ["npm", "start"]