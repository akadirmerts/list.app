import { useState, useEffect } from 'react';

export const translations = {
    tr: {
        hero: {
            title_1: "ORTAK",
            title_2: "LİSTE",
            subtitle: "Gerçek zamanlı, paylaşılabilir yapılacaklar listeleri. Kayıt yok, şifre yok.",
        },
        form: {
            placeholder: "Yaratıcı bir liste adı yazın...",
            password_placeholder: "Şifre (isteğe bağlı)...",
            create_btn: "OLUŞTUR",
            creating: "OLUŞTURULUYOR...",
        },
        features: {
            share_title: "PAYLAŞ",
            share_desc: "Kısa ve akılda kalıcı link ile paylaşın (Örn: Alpha-Bravo-123).",
            realtime_title: "CANLI",
            realtime_desc: "Tüm değişiklikleri anında görün, sayfayı yenilemeyin.",
            collab_title: "İŞBİRLİĞİ",
            collab_desc: "Arkadaşlarınızla aynı anda liste üzerinde çalışın.",
        },
        duration: {
            label: "Liste Süresi",
            d1: "1 Gün",
            w1: "1 Hafta",
            m1: "1 Ay",
            inf: "Süresiz"
        },
        list: {
            home_btn: "Ana Sayfa",
            users: "kişi",
            password_label: "Şifre",
            share_link: "Linki Kopyala",
            share_qr: "Karekod",
            add_placeholder: "Yeni öğe ekle...",
            add_btn: "Ekle",
            color_btn: "Renk",
            empty_state: "Henüz öğe yok. Başlamak için yukarıya yazın!",
            todo_title: "Yapılacak",
            completed_title: "Tamamlanan",
            show_completed: "Tamamlananları Göster",
            hide_completed: "Tamamlananları Gizle",
            password_modal: {
                title: "Bu liste şifre korumalı",
                desc: "Listeye erişmek için şifreyi girin.",
                placeholder: "Şifre girin...",
                cancel: "İptal",
                submit: "Devam Et"
            },
            qr_modal: {
                title: "Listeyi Paylaş",
                desc: "Arkadaşlarınız bu karekodu okutarak listeye katılabilir.",
                close: "Kapat"
            },
            notifications: {
                link_copied: "Link kopyalandı!",
                item_updated: "Öğe güncellendi",
                item_deleted: "Öğe silindi",
                error_add: "Öğe eklenemedi",
                error_update: "Öğe güncellenemedi",
                error_delete: "Öğe silinemedi",
                error_reorder: "Sıralama güncellenemedi",
                error_title: "Başlık güncellenemedi"
            },
            errors: {
                not_found_title: "Liste bulunamadı",
                not_found_btn: "Ana Sayfaya Dön",
                loading: "Liste yükleniyor..."
            }
        }
    },
    en: {
        hero: {
            title_1: "SHARED",
            title_2: "LIST",
            subtitle: "Real-time, shareable to-do lists. No registration, no password.",
        },
        form: {
            placeholder: "Enter a creative list name...",
            password_placeholder: "Password (optional)...",
            create_btn: "CREATE",
            creating: "CREATING...",
        },
        features: {
            share_title: "SHARE",
            share_desc: "Share with a short memorable link (e.g. Alpha-Bravo-123).",
            realtime_title: "REAL-TIME",
            realtime_desc: "See all changes instantly, no refresh needed.",
            collab_title: "COLLABORATION",
            collab_desc: "Work on the list together with friends.",
        },
        duration: {
            label: "List Duration",
            d1: "1 Day",
            w1: "1 Week",
            m1: "1 Month",
            inf: "Unlimited"
        },
        list: {
            home_btn: "Home",
            users: "users",
            password_label: "Password",
            share_link: "Copy Link",
            share_qr: "QR Code",
            add_placeholder: "Add new item...",
            add_btn: "Add",
            color_btn: "Color",
            empty_state: "No items yet. Type above to start!",
            todo_title: "To Do",
            completed_title: "Completed",
            show_completed: "Show Completed",
            hide_completed: "Hide Completed",
            password_modal: {
                title: "This list is password protected",
                desc: "Enter password to access the list.",
                placeholder: "Enter password...",
                cancel: "Cancel",
                submit: "Continue"
            },
            qr_modal: {
                title: "Share List",
                desc: "Friends can scan this QR code to join.",
                close: "Close"
            },
            notifications: {
                link_copied: "Link copied!",
                item_updated: "Item updated",
                item_deleted: "Item deleted",
                error_add: "Failed to add item",
                error_update: "Failed to update item",
                error_delete: "Failed to delete item",
                error_reorder: "Failed to reorder items",
                error_title: "Failed to update title"
            },
            errors: {
                not_found_title: "List not found",
                not_found_btn: "Return to Home",
                loading: "Loading list..."
            }
        }
    }
};

export function useLanguage() {
    const [lang, setLang] = useState<'tr' | 'en'>('tr');

    useEffect(() => {
        const stored = localStorage.getItem('app-lang');
        if (stored === 'en' || stored === 'tr') {
            setLang(stored);
        } else {
            // Detect browser language
            const browserLang = navigator.language.startsWith('en') ? 'en' : 'tr';
            setLang(browserLang);
        }
    }, []);

    const changeLang = (l: 'tr' | 'en') => {
        setLang(l);
        localStorage.setItem('app-lang', l);
    };

    return { lang, changeLang, t: translations[lang] };
}
