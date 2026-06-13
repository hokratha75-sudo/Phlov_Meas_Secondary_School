export interface LeaveRequestData {
    nameKh?: string;
    gender?: string;
    officerId?: string;
    position?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    totalDays?: number;
    reason?: string;
    actingTeacher?: string;
    addressDuringLeave?: string;
    createdAt?: string;
}

const checkMark = '☑'; // or &#9745;
const uncheckMark = '☐'; // or &#9744;

export const exportLeaveRequestToWord = (data: LeaveRequestData, filename = 'LeaveRequest.doc') => {
    // Format dates to Khmer
    const parseDate = (d: string | undefined) => {
        if (!d) return { day: '.....', month: '..........', year: '២០....' };
        const date = new Date(d);
        const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
        return {
            day: date.getDate().toString().padStart(2, '0'),
            month: khmerMonths[date.getMonth()],
            year: date.getFullYear().toString()
        };
    };

    const start = parseDate(data.startDate);
    const end = parseDate(data.endDate);
    
    // Determine checkmarks for leave types
    const t = data.leaveType || '';
    const isAnnual = t === 'ANNUAL' ? checkMark : uncheckMark;
    const isShortTerm = t === 'SHORT_TERM' ? checkMark : uncheckMark;
    const isSick = t === 'SICK_LEAVE' ? checkMark : uncheckMark;
    const isPersonal = t === 'PERSONAL' ? checkMark : uncheckMark;
    const isMaternity = t === 'MATERNITY' ? checkMark : uncheckMark;

    const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset="utf-8">
        <title>Leave Request</title>
        <style>
            @page {
                size: A4;
                margin: 2cm;
            }
            body {
                font-family: 'Khmer OS Battambang', 'Hanuman', sans-serif;
                font-size: 11pt;
                line-height: 1.5;
            }
            .muol {
                font-family: 'Khmer OS Muol Light', serif;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; }
            .table-bordered th, .table-bordered td {
                border: 1px solid black;
                padding: 4px;
                text-align: center;
                font-size: 10pt;
            }
            .checkbox { font-size: 14pt; font-family: 'Segoe UI Symbol', sans-serif; }
            .indent { text-indent: 1cm; }
        </style>
    </head>
    <body>
        <!-- Header -->
        <table>
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <div class="muol" style="font-size: 10pt;">មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត....................</div>
                    <div class="muol" style="font-size: 10pt;">វិទ្យាល័យ ផ្លូវមាស</div>
                    <div style="font-size: 10pt;">លេខ ៖ ........................................ ស.ច</div>
                </td>
                <td style="width: 50%; text-align: center; vertical-align: top;">
                    <div class="muol" style="font-size: 12pt;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div class="muol" style="font-size: 12pt;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <div style="font-family: 'Tacteing'; font-size: 20pt; margin-top: 5px;">3</div>
                </td>
            </tr>
        </table>

        <!-- Title -->
        <div class="text-center muol" style="margin-top: 20px; margin-bottom: 20px; font-size: 12pt;">
            សំណើសុំច្បាប់ និងការអនុញ្ញាតច្បាប់ឈប់សម្រាកគ្រប់ប្រភេទ<br/>
            របស់មន្ត្រីរាជការស៊ីវិល នៃព្រះរាជាណាចក្រកម្ពុជា
            <div style="font-size: 14pt;">* * * * *</div>
        </div>

        <div style="text-align: justify; margin-bottom: 10px;">
            <b>យោង៖</b> អនុក្រឹត្យលេខ២១៧អនក្រ.បក. ចុះថ្ងៃទី២ ខែឧសភា ឆ្នាំ២០១៣ស្តីពីរបបការសុំច្បាប់ឈប់សម្រាកគ្រប់ប្រភេទរបស់មន្ត្រីរាជការស៊ីវិល នៃព្រះរាជាណាចក្រកម្ពុជា ។
        </div>

        <div style="margin-bottom: 10px;">
            ១.គោត្តនាម និងនាម <span style="border-bottom: 1px dotted black; display: inline-block; width: 150px; text-align: center;">${data.nameKh || ''}</span>
            ភេទ <span style="border-bottom: 1px dotted black; display: inline-block; width: 50px; text-align: center;">${data.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</span>
            អត្តលេខ <span style="border-bottom: 1px dotted black; display: inline-block; width: 150px; text-align: center;">${data.officerId || ''}</span><br/>
            មុខតំណែង <span style="border-bottom: 1px dotted black; display: inline-block; width: 200px; text-align: center;">${data.position || 'គ្រូបង្រៀន'}</span>
            អង្គភាព <span style="border-bottom: 1px dotted black; display: inline-block; width: 200px; text-align: center;">វិទ្យាល័យ ផ្លូវមាស</span><br/>
            លេខទូរស័ព្ទ <span style="border-bottom: 1px dotted black; display: inline-block; width: 200px; text-align: center;">${data.addressDuringLeave || ''}</span>
        </div>

        <div style="margin-bottom: 10px;">
            ២.ប្រភេទនៃច្បាប់ឈប់សម្រាកដែលត្រូវស្នើសុំ៖<br/>
            <table>
                <tr>
                    <td><span class="checkbox">${isAnnual}</span> ច្បាប់ប្រចាំឆ្នាំ</td>
                    <td><span class="checkbox">${isShortTerm}</span> ច្បាប់រយៈពេលខ្លី</td>
                    <td><span class="checkbox">${isMaternity}</span> ច្បាប់សម្រាកប្រកបមាតុភាព</td>
                </tr>
                <tr>
                    <td><span class="checkbox">${isPersonal}</span> ច្បាប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន</td>
                    <td colspan="2"><span class="checkbox">${isSick}</span> ច្បាប់សម្រាកដោយមានការកិច្ចថែទាំកូន</td>
                </tr>
            </table>
        </div>

        <div style="margin-bottom: 10px;">
            ៣.ចំនួនថ្ងៃស្នើសុំច្បាប់ កាលបរិច្ឆេទនៃការចាប់ផ្តើមឈប់ និងកាលបរិច្ឆេទនៃការចូលបម្រើការងារវិញ<br/>
            <div style="margin-left: 20px;">
                - ចំនួនថ្ងៃស្នើសុំឈប់៖ <span style="border-bottom: 1px dotted black; display: inline-block; width: 300px;">${data.totalDays || 0} ថ្ងៃ</span><br/>
                - ថ្ងៃ ខែ ឆ្នាំចាប់ផ្តើមឈប់៖ <span style="border-bottom: 1px dotted black; display: inline-block; width: 300px;">ថ្ងៃទី ${start.day} ខែ ${start.month} ឆ្នាំ ${start.year}</span><br/>
                - ថ្ងៃ ខែ ឆ្នាំចូលបម្រើការងារវិញ៖ <span style="border-bottom: 1px dotted black; display: inline-block; width: 300px;">ថ្ងៃទី ${end.day} ខែ ${end.month} ឆ្នាំ ${end.year}</span>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            ៤.គោលបំណង ៖ <span style="border-bottom: 1px dotted black; display: inline-block; width: 80%;">${data.reason || ''}</span>
            <br/><br/>
            <table>
                <tr>
                    <td style="width: 50%;">
                        <span class="checkbox">${uncheckMark}</span> អនុញ្ញាត <span class="checkbox" style="margin-left: 20px;">${uncheckMark}</span> មិនអនុញ្ញាត<br/>
                        <b>ហត្ថលេខាប្រធានការិយាល័យ</b>
                    </td>
                    <td style="width: 50%; text-align: center;">
                        ថ្ងៃទី...........ខែ...........ឆ្នាំ២០.......<br/>
                        <b>ហត្ថលេខាមន្ត្រីស្នើសុំ</b>
                        <br/><br/><br/><br/>
                        ${data.nameKh || ''}
                    </td>
                </tr>
            </table>
        </div>

        <div style="margin-bottom: 20px;">
            ៥.ការិយាល័យបុគ្គលិកដើម្បីជ្រាបជាព័ត៌មាន និងផ្ទៀងផ្ទាត់
            <table class="table-bordered" style="width: 100%; margin-top: 5px;">
                <tr>
                    <th>ឈប់ប្រចាំឆ្នាំ</th>
                    <th>ឈប់រយៈពេលខ្លី</th>
                    <th>ឈប់សម្រាកលំហែមាតុភាព</th>
                    <th>ឈប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន</th>
                    <th>ឈប់សម្រាកដោយមានការកិច្ចថែទាំកូន</th>
                </tr>
                <tr>
                    <td style="height: 30px;"></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                    <td style="height: 30px;"></td><td></td><td></td><td></td><td></td>
                </tr>
            </table>
            <div style="margin-top: 5px;">ហត្ថលេខា និងកាលបរិច្ឆេទរបស់មន្ត្រីទទួលបន្ទុកគ្រប់គ្រងបុគ្គលិក</div>
        </div>

        <hr style="border: 1px dashed black; margin: 20px 0;"/>

        <table>
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    ៦.ការអនុញ្ញាតរបស់ប្រធានអង្គភាព<br/>
                    <span class="checkbox">${uncheckMark}</span> អនុញ្ញាត <span class="checkbox" style="margin-left: 20px;">${uncheckMark}</span> មិនអនុញ្ញាត<br/>
                    យោបល់ ៖ ............................................................................<br/>
                    ...................................................................................................<br/><br/>
                    <b>ហត្ថលេខា និងកាលបរិច្ឆេទប្រធានស្ថាប័ន/អង្គភាព</b>
                </td>
                <td style="width: 50%; vertical-align: top;">
                    <table class="table-bordered" style="width: 100%;">
                        <tr>
                            <th style="width: 40px;">ម៉ោង</th>
                            <th>ច័ន្ទ</th><th>អង្គារ</th><th>ពុធ</th><th>ព្រ.ហ</th><th>សុក្រ</th><th>សៅរ៍</th>
                        </tr>
                        <tr><td>7h-8h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        <tr><td>8h-9h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        <tr><td>9h-10h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        <tr><td>10h-11h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        <tr><td>2h-3h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        <tr><td>3h-4h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                        <tr><td>4h-5h</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    // Add Word XML metadata to make Word understand it
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
