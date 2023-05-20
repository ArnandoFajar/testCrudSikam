**Interview Test CRUD untuk produk-produk Penjualan**

Buatkan API menggunakan node express js dengan soal berikut:

1. CRUD untuk produk-produk penjualan
1. ada fitur keranjang
1. checkout fitur dimana mengurangi stok produk yang ada
1. terapkan queue mengunakan rabbitmq pada saat checkout
1. buat fitur pembayaran ,dan berdampak untuk mengubah status pesanan
1. buat fitur batalkan pesanan untuk mengubah status pesanan

**Library Yang digunakan**

1. Node.js
2. Express.js
3. Moment.js
4. Mysql
5. amqplib

**Link** **Dokumentasi API**

https://blue-crescent-424557.postman.co/workspace/API-TEST~92e73999-b17a-4d89-befa-1208ea27676a/collection/27441146-0617cdd0-3258-4b47-b9a6-1aad8298a71d?action=share&creator=27441146

**Database** 

test_sikam.sql

**Penjelasan File**

1. Folder server/config
   didalam ini ada file pengaturan koneksi ke database
2. Folder server/controller
   didalam folder controller terdapat file js untuk terhubung antara view(routes) dengan Model
3. Folder server/Models
   didalam folder ini terdapat file js yang berkomunikasi langsung dengan tabel di database
4. Folder server/Routes
   didalam folder ini pengaturan untuk get link api yang mengarahkan controller mana yang akan dituju
5. consumeCheckout.js
   untuk melihat message queue pada checkout
6. index.js
   file pertama yang dijalankan untuk mengaktifkan server
