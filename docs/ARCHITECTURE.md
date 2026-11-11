# 🏗️ ស្ថាបត្យកម្មប្រព័ន្ធ (System Architecture)

## ១. ប្រព័ន្ធ Auto-PASS និង Auto-Reset State Machine
ប្រព័ន្ធត្រូវបានរចនាឡើងដើម្បីគាំទ្រការតេស្តឧបករណ៍ច្រើនគ្រឿងជាប់ៗគ្នា (Batch Testing):
- **Active Testing State**: រាប់ចំនួនគ្រាប់ចុច និងត្រួតពិនិត្យបញ្ហា (Chatter, Stuck Key, Double-Click Fault)។
- **PASS State**: លោតផ្ទាំង `PASS ✅` នៅពេលតេស្តគ្រប់ 100% នៃគោលដៅ បន្លឺសំឡេងបញ្ជាក់ និងកត់ត្រាចូលក្នុងតារាងប្រវត្តិ (Batch Log)។
- **Countdown & Reset State**: រាប់ថយក្រោយ **10 នាទី** (600 វិនាទី) ឬតាមការកំណត់របស់អ្នកប្រើប្រាស់ ដើម្បី Reset ទិន្នន័យតេស្តទៅ 0% វិញដោយស្វ័យប្រវត្តិ។

## ២. រចនាសម្ព័ន្ធឯកសារ (Directory Structure)
- `index.html`: ទំព័រមេនៃប្រព័ន្ធតេស្តទាំងអស់
- `styles.css`, `css/variables.css`, `css/responsive.css`: រចនាប័ទ្ម UI និង Responsive Design
- `app.js`: ម៉ាស៊ីនដំណើរការតេស្តគោល (Keyboard, Mouse, Screen, Audio, Webcam, Gamepad)
- `js/export-report.js`: មុខងារទាញយករបាយការណ៍តេស្តជាឯកសារ CSV
- `js/system-info.js`: មុខងារត្រួតពិនិត្យ CPU, RAM និងកាតក្រាហ្វិក (WebGL GPU)
- `js/touch-test.js`: មុខងារឆែកអេក្រង់ Touch Screen
