import { Routes } from '@angular/router';
import { InvoiceFormComponent } from './pages/Invoice/components/Invoice-form/Invoice-form.component';
import { InvoicesDashboardComponent } from './pages/Invoice/components/Invoice-dashboard/Invoice-dashboard.component';
import { NotFoundComponent } from './pages/Page 404/Not-found/Not-found.component';
import { ChatComponent } from './pages/Chatbot/components/Chatbot/Chatbot.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/invoices',
        pathMatch: 'full'
    },
    {
        path: 'invoices',
        component: InvoicesDashboardComponent,
        title: "لوحة التحكم بالفواتير",
    },
    {
        path: 'invoices/add',
        component: InvoiceFormComponent,
        title: "إضافة فاتورة",
    },
    {
        path: 'chat',
        component: ChatComponent,
        title: "المحادثة الذكية"
    },
    // Legacy routes for backward compatibility
    {
        path: 'form',
        redirectTo: '/invoices/add',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        redirectTo: '/invoices',
        pathMatch: 'full'
    },
    {
        path: 'chatbot',
        redirectTo: '/chat',
        pathMatch: 'full'
    },
    {   
        path: '**',
        component: NotFoundComponent,
        title: "صفحة غير موجودة",
    },
];
