# Ortak Liste Uygulaması - Kurulum Rehberi

Bu projeyi çalıştırmak için aşağıdaki adımları izleyin.

## 1. Ön Gereksinimler

Bilgisayarınızda şunların kurulu olması gerekir:
- [Node.js](https://nodejs.org/) (Sürüm 18 veya üzeri önerilir)
- [MySQL](https://www.mysql.com/) Veritabanı
- Paket Yöneticisi: Proje `pnpm` kullanmaktadır. Node.js kurduktan sonra terminalden kurabilirsiniz:
  ```bash
  npm install -g pnpm
  ```

## 2. Kurulum

Proje dizininde bir terminal açın ve bağımlılıkları yükleyin:

```bash
pnpm install
```

*Not: Eğer `pnpm` hata verirse, Node.js kurulumunuzu kontrol edin ve terminali yönetici olarak yeniden başlatmayı deneyin.*

## 3. Yapılandırma (.env)

Proje kök dizininde `.env` isimli bir dosya oluşturun (veya `.env.example` dosyasının ismini değiştirin) ve içeriğini düzenleyin:

```ini
DATABASE_URL="mysql://kullaniciadi:sifre@localhost:3306/veritabani_adi"
JWT_SECRET="buraya-rastgele-uzun-bir-sifre-yazin"
```
*MySQL veritabanınızda `veritabani_adi` (örn: ortak_liste_app) isminde boş bir veritabanı oluşturduğunuzdan emin olun.*

## 4. Veritabanını Hazırlama

Tabloları veritabanına oluşturmak için:

```bash
pnpm db:push
```

## 5. Uygulamayı Başlatma

Geliştirme sunucusunu başlatmak için:

```bash
pnpm dev
```

Uygulama genellikle [http://localhost:5173](http://localhost:5173) adresinde çalışacaktır.
