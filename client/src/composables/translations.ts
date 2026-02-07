export type Language = 'en' | 'jp' | 'vn';

export interface TranslationSchema {
    common: {
        back: string;
        save: string;
        cancel: string;
        edit: string;
        loading: string;
        error: string;
        success: string;
        actions: string;
    };
    nav: {
        home: string;
        menu: string;
        about: string;
        dashboard: string;
        login: string;
        register: string;
        logout: string;
        profile: string;
        products: string;
        orders: string;
        inventory: string;
        reports: string;
        users: string;
        shop: string;
        settings: string;
        notifications: string;
        markAllRead: string;
        viewAll: string;
        noNotifications: string;
    };
    landing: {
        heroTitle: string;
        heroSubtitle: string;
        viewMenu: string;
        enterShop: string;
        featuredProducts: string;
        locationTitle: string;
        footerText: string;
    };
    shop: {
        cartTitle: string;
        emptyCart: string;
        addToCart: string;
        checkout: string;
        total: string;
        items: string;
        categories: string;
        selection: string;
        slogan: string;
        yourBasket: string;
        menu: string;
        myOrders: string;
        shopOrders: string;
        noOrders: string;
        startBrowsing: string;
        viewDetails: string;
        customerInfo: string;
        loginRequired: string;
        loginPrompt: string;
        loginNow: string;
        maybeLater: string;
    };
    auth: {
        welcomeBack: string;
        createAccount: string;
        email: string;
        password: string;
        signIn: string;
        signUp: string;
        noAccount: string;
        haveAccount: string;
        fullName: string;
        phone: string;
        address: string;
        confirmPassword: string;
        joinTitle: string;
        joinSubtitle: string;
        passMismatch: string;
        passTooShort: string;
    };
    dashboard: {
        managementSuite: string;
        artisanInsights: string;
        heroSubtitle: string;
        status: string;
        active: string;
        totalRevenue: string;
        fromOrders: string;
        activeOrders: string;
        waitingAction: string;
        totalProducts: string;
        activeCatalog: string;
        lowStockItems: string;
        requiringAttention: string;
        liveUpdates: string;
        inventoryAlerts: string;
        refillRecommended: string;
        critical: string;
        inventoryOptimal: string;
        signatureCatalog: string;
    };
}

export const defaultTranslations: Record<Language, TranslationSchema> = {
    en: {
        common: {
            back: 'Back',
            save: 'Save Changes',
            cancel: 'Cancel',
            edit: 'Edit',
            loading: 'Loading...',
            error: 'Something went wrong',
            success: 'Operation successful',
            actions: 'Actions'
        },
        nav: {
            home: 'Home',
            menu: 'Menu',
            about: 'Our Story',
            dashboard: 'Dashboard',
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            profile: 'Account',
            products: 'Products',
            orders: 'Orders',
            inventory: 'Inventory',
            reports: 'Reports',
            users: 'Users',
            shop: 'Shop',
            settings: 'Settings',
            notifications: 'Notifications',
            markAllRead: 'Mark all read',
            viewAll: 'View all notifications',
            noNotifications: 'No notifications yet'
        },
        landing: {
            heroTitle: 'Artisan Baking, Crafted with Passion',
            heroSubtitle: 'Experience the perfection of handcrafted pastries and sourdough, baked fresh every morning with premium organic ingredients.',
            viewMenu: 'View Menu',
            enterShop: 'Enter Shop',
            featuredProducts: 'Daily Creations',
            locationTitle: 'Find Our Atelier',
            footerText: '© 2026 The Artisan Bakery. All rights reserved.'
        },
        shop: {
            cartTitle: 'Your Selection',
            emptyCart: 'Your basket is empty',
            addToCart: 'Add to Basket',
            checkout: 'Complete Order',
            total: 'Total Amount',
            items: 'Items',
            categories: 'Categories',
            selection: 'Our Selection',
            slogan: 'Handcrafted treats, baked with precision and passion.',
            yourBasket: 'Your Basket',
            menu: 'Menu',
            myOrders: 'My Orders',
            shopOrders: 'Shop Orders',
            noOrders: 'No orders yet',
            startBrowsing: 'Start browsing our menu to place your first order!',
            viewDetails: 'View Details',
            customerInfo: 'Customer Information',
            loginRequired: 'Login Required',
            loginPrompt: 'You need to be logged in to place an order. Join us for premium perks!',
            loginNow: 'Login Now',
            maybeLater: 'Maybe Later'
        },
        auth: {
            welcomeBack: 'Welcome Back',
            createAccount: 'Join the Bakery',
            email: 'Email Address',
            password: 'Secure Password',
            signIn: 'Sign In',
            signUp: 'Register',
            noAccount: "Don't have an account?",
            haveAccount: 'Already a member?',
            fullName: 'Full Name',
            phone: 'Phone Number',
            address: 'Delivery Address',
            confirmPassword: 'Confirm Password',
            joinTitle: 'Join the Family',
            joinSubtitle: 'Register for exclusive access and rewards',
            passMismatch: 'Passwords do not match',
            passTooShort: 'Password must be at least 6 characters'
        },
        dashboard: {
            managementSuite: 'Management Suite',
            artisanInsights: 'Artisan Insights',
            heroSubtitle: 'Real-time performance metrics for your handcrafted bakery operations.',
            status: 'Status',
            active: 'Active',
            totalRevenue: 'Total Revenue',
            fromOrders: 'From {n} orders',
            activeOrders: 'Active Orders',
            waitingAction: 'Waiting for action',
            totalProducts: 'Total Products',
            activeCatalog: 'Active catalog',
            lowStockItems: 'Low Stock Items',
            requiringAttention: 'Requiring attention',
            liveUpdates: 'Live Updates',
            inventoryAlerts: 'Inventory Alerts',
            refillRecommended: 'Refill Recommended',
            critical: 'Critical',
            inventoryOptimal: 'All inventory levels are optimal.',
            signatureCatalog: 'Signature Catalog'
        }
    },
    jp: {
        common: {
            back: '戻る',
            save: '変更を保存',
            cancel: 'キャンセル',
            edit: '編集',
            loading: '読み込み中...',
            error: 'エラーが発生しました',
            success: '完了しました',
            actions: '操作'
        },
        nav: {
            home: 'ホーム',
            menu: 'メニュー',
            about: 'ストーリー',
            dashboard: 'ダッシュボード',
            login: 'ログイン',
            register: '新規登録',
            logout: 'ログアウト',
            profile: 'アカウント',
            products: '商品管理',
            orders: '注文管理',
            inventory: '在庫管理',
            reports: 'レポート',
            users: 'ユーザー管理',
            shop: 'ショップ',
            settings: '設定',
            notifications: '通知',
            markAllRead: 'すべて既読にする',
            viewAll: 'すべての通知を表示',
            noNotifications: '通知はありません'
        },
        landing: {
            heroTitle: '情熱を込めた、職人の焼き菓子',
            heroSubtitle: '厳選されたオーガニック素材を使用し、毎朝焼き上げる手作りパンとサワードゥの最高の一品をお楽しみください。',
            viewMenu: 'メニューを見る',
            enterShop: 'ショップに入る',
            featuredProducts: '本日のおすすめ',
            locationTitle: '店舗案内',
            footerText: '© 2026 The Artisan Bakery. 無断複写・転載を禁じます。'
        },
        shop: {
            cartTitle: 'カートの内容',
            emptyCart: 'カートは空です',
            addToCart: 'カートに入れる',
            checkout: '注文を確定する',
            total: '合計金額',
            items: '商品',
            categories: 'カテゴリー',
            selection: '厳選されたメニュー',
            slogan: '職人が情熱を込めて、一つ一つ丁寧に焼き上げました。',
            yourBasket: 'お買い物カゴ',
            menu: 'メニュー',
            myOrders: '注文履歴',
            shopOrders: '店舗の注文',
            noOrders: '注文はまだありません',
            startBrowsing: 'メニューから最初の商品を選んでみましょう！',
            viewDetails: '詳細を見る',
            customerInfo: 'お客様情報',
            loginRequired: 'ログインが必要です',
            loginPrompt: 'ログインして注文を確定しましょう。魅力的な特典をご用意しています！',
            loginNow: 'ログインする',
            maybeLater: '後で'
        },
        auth: {
            welcomeBack: 'おかえりなさい',
            createAccount: '会員登録',
            email: 'メールアドレス',
            password: 'パスワード',
            signIn: 'サインイン',
            signUp: '登録する',
            noAccount: 'アカウントをお持ちではありませんか？',
            haveAccount: 'すでに会員ですか？',
            fullName: 'フルネーム',
            phone: '電話番号',
            address: '配送先住所',
            confirmPassword: 'パスワードの確認',
            joinTitle: 'コミュニティに参加',
            joinSubtitle: '登録して限定アクセスと特典を受け取りましょう',
            passMismatch: 'パスワードが一致しません',
            passTooShort: 'パスワードは6文字以上である必要があります'
        },
        dashboard: {
            managementSuite: '管理スイート',
            artisanInsights: '職人のインサイト',
            heroSubtitle: '手作りベーカリー運営のためのリアルタイム・パフォーマンス・メトリクス。',
            status: 'ステータス',
            active: 'アクティブ',
            totalRevenue: '総収益',
            fromOrders: '{n}件の注文から',
            activeOrders: 'アクティブな注文',
            waitingAction: 'アクション待機中',
            totalProducts: '全商品',
            activeCatalog: '有効なカタログ',
            lowStockItems: '在庫不足アイテム',
            requiringAttention: '要注意',
            liveUpdates: 'ライブ更新',
            inventoryAlerts: '在庫アラート',
            refillRecommended: '補充推奨',
            critical: '重要',
            inventoryOptimal: 'すべての在庫レベルは最適です。',
            signatureCatalog: 'シグネチャーカタログ'
        }
    },
    vn: {
        common: {
            back: 'Quay lại',
            save: 'Lưu thay đổi',
            cancel: 'Hủy bỏ',
            edit: 'Chỉnh sửa',
            loading: 'Đang tải...',
            error: 'Đã xảy ra lỗi',
            success: 'Thành công',
            actions: 'Thao tác'
        },
        nav: {
            home: 'Trang chủ',
            menu: 'Thực đơn',
            about: 'Câu chuyện',
            dashboard: 'Quản trị',
            login: 'Đăng nhập',
            register: 'Đăng ký',
            logout: 'Đăng xuất',
            profile: 'Tài khoản',
            products: 'Sản phẩm',
            orders: 'Đơn hàng',
            inventory: 'Kho hàng',
            reports: 'Báo cáo',
            users: 'Người dùng',
            shop: 'Cửa hàng',
            settings: 'Cài đặt',
            notifications: 'Thông báo',
            markAllRead: 'Đánh dấu tất cả là đã đọc',
            viewAll: 'Xem tất cả thông báo',
            noNotifications: 'Chưa có thông báo nào'
        },
        landing: {
            heroTitle: 'Bánh Thủ Công, Trọn Vẹn Đam Mê',
            heroSubtitle: 'Trải nghiệm sự hoàn hảo của các loại bánh ngọt và bánh mì men tự nhiên, được nướng mới mỗi sáng với nguyên liệu hữu cơ cao cấp.',
            viewMenu: 'Xem thực đơn',
            enterShop: 'Vào cửa hàng',
            featuredProducts: 'Sáng tạo mỗi ngày',
            locationTitle: 'Tìm cửa hàng',
            footerText: '© 2026 The Artisan Bakery. Tất cả quyền được bảo lưu.'
        },
        shop: {
            cartTitle: 'Giỏ hàng của bạn',
            emptyCart: 'Giỏ hàng trống',
            addToCart: 'Thêm vào giỏ',
            checkout: 'Thanh toán',
            total: 'Tổng cộng',
            items: 'Sản phẩm',
            categories: 'Danh mục',
            selection: 'Sản phẩm chọn lọc',
            slogan: 'Món quà thủ công, nướng với tâm huyết và độ chính xác cao.',
            yourBasket: 'Giỏ hàng',
            menu: 'Thực đơn',
            myOrders: 'Đơn hàng của tôi',
            shopOrders: 'Đơn hàng tại quầy',
            noOrders: 'Chưa có đơn hàng nào',
            startBrowsing: 'Bắt đầu xem thực đơn để đặt đơn hàng đầu tiên của bạn!',
            viewDetails: 'Xem chi tiết',
            customerInfo: 'Thông tin khách hàng',
            loginRequired: 'Yêu cầu đăng nhập',
            loginPrompt: 'Bạn cần đăng nhập để đặt hàng. Tham gia ngay để nhận ưu đãi cao cấp!',
            loginNow: 'Đăng nhập ngay',
            maybeLater: 'Để sau'
        },
        auth: {
            welcomeBack: 'Chào mừng trở lại',
            createAccount: 'Tham gia gia đình Bakery',
            email: 'Địa chỉ Email',
            password: 'Mật khẩu bảo mật',
            signIn: 'Đăng nhập',
            signUp: 'Đăng ký ngay',
            noAccount: 'Chưa có tài khoản?',
            haveAccount: 'Đã là thành viên?',
            fullName: 'Họ và tên',
            phone: 'Số điện thoại',
            address: 'Địa chỉ giao hàng',
            confirmPassword: 'Xác nhận mật khẩu',
            joinTitle: 'Tham gia gia đình',
            joinSubtitle: 'Đăng ký để nhận quyền truy cập và phần thưởng độc quyền',
            passMismatch: 'Mật khẩu không khớp',
            passTooShort: 'Mật khẩu phải có ít nhất 6 ký tự'
        },
        dashboard: {
            managementSuite: 'Bộ Công Cụ Quản Lý',
            artisanInsights: 'Thông Tin Chuyên Sâu',
            heroSubtitle: 'Các chỉ số hiệu suất thời gian thực cho hoạt động làm bánh thủ công của bạn.',
            status: 'Trạng thái',
            active: 'Đang hoạt động',
            totalRevenue: 'Tổng Doanh Thu',
            fromOrders: 'Từ {n} đơn hàng',
            activeOrders: 'Đơn Hàng Đang Xử Lý',
            waitingAction: 'Đang chờ xử lý',
            totalProducts: 'Tổng Sản Phẩm',
            activeCatalog: 'Danh mục hoạt động',
            lowStockItems: 'Mặt Hàng Sắp Hết',
            requiringAttention: 'Cần chú ý',
            liveUpdates: 'Cập nhật trực tiếp',
            inventoryAlerts: 'Cảnh Báo Kho Hàng',
            refillRecommended: 'Khuyên dùng bổ sung',
            critical: 'Nguy cấp',
            inventoryOptimal: 'Tất cả mức tồn kho đều tối ưu.',
            signatureCatalog: 'Danh Mục Đặc Trưng'
        }
    }
};
