# Ortak Liste Uygulaması - TODO

## Veritabanı ve Arka Uç
- [x] Veritabanı şeması tasarla (listeler, öğeler, oturumlar)
- [x] Hatırlaması kolay benzersiz URL oluştur (slug generator)
- [x] tRPC yordamları: liste oluştur, getir, güncelle
- [x] tRPC yordamları: öğe ekleme, düzenleme, silme, sıralama
- [x] WebSocket bağlantısı ve gerçek zamanlı senkronizasyon
- [ ] Bildirim sistemi (liste değişikliklerini push et)

## Ön Uç - Sayfa ve Bileşenler
- [x] Ana sayfa (landing page) - Memphis tarzı tasarım
- [x] Liste oluşturma sayfası
- [x] Liste görüntüleme ve düzenleme sayfası
- [x] Gerçek zamanlı öğe ekleme/düzenleme/silme UI
- [x] Öğe tamamlama/işareti kaldırma
- [x] Sürükle-bırak veya yukarı/aşağı butonları ile sıralama
- [ ] Renklendirme ve kategorilendirme UI
- [x] Liste başlığı düzenleme
- [x] Paylaşılabilir link gösterme ve kopyalama

## Tasarım - Memphis Tarzı Estetik
- [x] Genel tema renkleri: şeftali arka plan, nane yeşili, leylak, sarı pastel
- [x] Geometrik şekiller (daireler, üçgenler, dikdörtgenler) arka plan dekorasyonu
- [x] Kalın, büyük harfli sans-serif tipografi
- [x] Siyah gölge efektleri ve kontrastlar
- [x] Siyah vurgu noktaları, elmaslar, çizgiler
- [ ] Mobil responsive tasarım (test ve optimize)

## Test ve Optimizasyon
- [ ] Mobil uyumluluğu test et
- [ ] Gerçek zamanlı senkronizasyon test et
- [ ] Performans optimizasyonu
- [ ] Tarayıcı uyumluluğu test et
- [ ] Bildirim sistemi entegrasyonu

## Tamamlanan Öğeler
- [x] Web projesi iskeletini oluştur (webdev_init_project)
- [x] Veritabanı şeması ve tRPC yordamları
- [x] WebSocket gerçek zamanlı bağlantısı
- [x] Memphis tarzı UI tasarımı ve sayfaları
- [x] Ana sayfa ve liste sayfası implementasyonu


## Yeni İstekler - Renk & Kategori Etiketleri
- [x] Renk kodları ve kategori etiketleri UI'ı geliştir
- [x] Öğe düzenleme modalı/formu ile kategori ve renk seçimi
- [x] Kategori filtreleme bileşeni
- [x] Renk göstergesi liste öğelerinde
- [x] CategoryColorPicker bileşeni (6 kategori, 6 renk)
- [x] ItemEditModal bileşeni
- [x] CategoryBadge görsel göstergesi


## Güncelleme İstekleri - Renk & Şifre
- [x] Kategorileri kaldır - sadece renk seçeneği bırak
- [x] Yazı tipi Türkçe karakterlere uygun yap
- [x] Textbox altında temel renkler göster
- [x] Renk seçimi sonrası ekle tuşuna basıldığında o renkte ekle
- [x] Liste öğesine hover'da renk değiştirme ikonu ekle
- [x] İlerleme yüzdesini kaldır
- [x] Tamamlanan öğeleri gizle - Tamamlananları Göster butonu ekle
- [x] Listeye Şifre koruması ekle
- [x] Şifre ile liste açma/kilitleme özelliği

## Yeni İstek - Sürükle-Bırak Sıralama
- [x] @dnd-kit kütüphanelerini yükle
- [x] Sürükle-bırak sıralama bileşenini ListPage'e entegre et
- [x] SortableListItem bileşeni oluştur
- [x] handleDragEnd fonksiyonunu uygula


## Hata Düzeltme
- [x] Liste sayfasındaki sorunları tespit et ve düzelt


## Hata Düzeltme - Şifre Doğrulama
- [ ] ListPage'de şifre modal'ı düzgün çalışmıyor
- [ ] Şifre doğrulama mantığını düzelt
- [ ] Şifre modal'ında submit işlemini kontrol et
