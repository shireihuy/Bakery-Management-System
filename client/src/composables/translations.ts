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
        paymentTitle: string;
        selectPayment: string;
        payWithMoMo: string;
        payWithZaloPay: string;
        payWithCash: string;
        scanQR: string;
        confirmPayment: string;
        processingPayment: string;
        paymentSuccess: string;
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
    orders: {
        totalOrders: string;
        pending: string;
        processing: string;
        searchPlaceholder: string;
        allStatus: string;
        orderId: string;
        customer: string;
        date: string;
        items: string;
        total: string;
        status: string;
        actions: string;
        noOrdersFound: string;
        viewDetails: string;
        orderDetails: string;
        placedOn: string;
        updateStatus: string;
        startBaking: string;
        markReady: string;
        markCompleted: string;
        cancelOrder: string;
        orderFulfilled: string;
        orderCancelled: string;
        customerDetails: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        orderTimeline: string;
        orderItems: string;
        product: string;
        qty: string;
        price: string;
        subtotal: string;
        notes: string;
    };
    products: {
        productManagement: string;
        addProduct: string;
        editProduct: string;
        updateProduct: string;
        searchProducts: string;
        allCategories: string;
        noProductsFound: string;
        price: string;
        stock: string;
        productName: string;
        category: string;
        unit: string;
        description: string;
        rating: string;
        uploadImage: string;
        orUseUrl: string;
    };
    reports: {
        analyticsReports: string;
        trackGrowth: string;
        exportCsv: string;
        totalRevenueWeekly: string;
        totalWeeklyOrders: string;
        averageOrderValue: string;
        fromLastWeek: string;
        salesVolume: string;
        fromAverage: string;
        revenueOverTime: string;
        sevenDayAnalytics: string;
        categoryDistribution: string;
        bestSellingProducts: string;
        totalSales: string;
        totalRevenue: string;
        currentTrend: string;
        performanceScore: string;
        viewRankings: string;
    };
    users: {
        userManagement: string;
        manageStaff: string;
        addNewUser: string;
        editUser: string;
        searchPlaceholder: string;
        allRoles: string;
        user: string;
        role: string;
        status: string;
        contactInfo: string;
        joinedDate: string;
        noUsersFound: string;
        fullName: string;
        email: string;
        password: string;
        phone: string;
        address: string;
        createUser: string;
        updating: string;
        creating: string;
        confirmDeletion: string;
        deleteWarning: string;
        understandPermanent: string;
        deletePermanently: string;
    };
    inventory: {
        inventoryManagement: string;
        monitorAndManage: string;
        totalItems: string;
        lowStock: string;
        categories: string;
        restocksToday: string;
        addNewItem: string;
        searchPlaceholder: string;
        allCategories: string;
        itemDetails: string;
        category: string;
        stockLevel: string;
        status: string;
        lastRestock: string;
        editItem: string;
        outOfStock: string;
        inStock: string;
        itemName: string;
        unit: string;
        currentQuantity: string;
        minStockAlert: string;
        newInventoryItem: string;
        editInventoryItem: string;
    };
    settings: {
        accountSettings: string;
        managePersonal: string;
        profile: string;
        notifications: string;
        security: string;
        coupons: string;
        fullName: string;
        emailAddress: string;
        phoneNumber: string;
        role: string;
        address: string;
        saveChanges: string;
        saving: string;
        profileUpdated: string;
        profileUpdateFailed: string;
    };
    notifications: {
        notificationsCenter: string;
        stayUpdated: string;
        markAllAsRead: string;
        filterBy: string;
        totalAlerts: string;
        noNotifications: string;
        caughtUp: string;
        markAsRead: string;
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
            maybeLater: 'Maybe Later',
            paymentTitle: 'Secure Payment',
            selectPayment: 'Select your preferred payment method',
            payWithMoMo: 'Pay with MoMo',
            payWithZaloPay: 'Pay with ZaloPay',
            payWithCash: 'Pay at Shop (Cash)',
            scanQR: 'Please scan the QR code to complete your payment',
            confirmPayment: 'I have completed the payment',
            processingPayment: 'Processing Payment...',
            paymentSuccess: 'Payment Successful!'
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
        },
        orders: {
            totalOrders: 'Total Orders',
            pending: 'Pending',
            processing: 'Processing',
            searchPlaceholder: 'Search #ID or customer...',
            allStatus: 'All Status',
            orderId: 'Order ID',
            customer: 'Customer',
            date: 'Date',
            items: 'Items',
            total: 'Total',
            status: 'Status',
            actions: 'Actions',
            noOrdersFound: 'No orders found matching your criteria',
            viewDetails: 'View Details',
            orderDetails: 'Order Details',
            placedOn: 'Placed on',
            updateStatus: 'Update Status',
            startBaking: 'Start Baking',
            markReady: 'Mark Ready',
            markCompleted: 'Mark Completed',
            cancelOrder: 'Cancel Order',
            orderFulfilled: 'Order Fulfilled',
            orderCancelled: 'Order Cancelled',
            customerDetails: 'Customer Details',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            address: 'Address',
            orderTimeline: 'Order Timeline',
            orderItems: 'Order Items',
            product: 'Product',
            qty: 'Qty',
            price: 'Price',
            subtotal: 'Subtotal',
            notes: 'Notes'
        },
        products: {
            productManagement: 'Product Management',
            addProduct: 'Add Product',
            editProduct: 'Edit Product',
            updateProduct: 'Update Product',
            searchProducts: 'Search products...',
            allCategories: 'All Categories',
            noProductsFound: 'No products found. Try adjusting your filters.',
            price: 'Price',
            stock: 'Stock',
            productName: 'Product Name',
            category: 'Category',
            unit: 'Unit',
            description: 'Description',
            rating: 'Rating',
            uploadImage: 'Upload product image',
            orUseUrl: 'Or use URL'
        },
        reports: {
            analyticsReports: 'Analytics & Reports',
            trackGrowth: "Track your bakery's growth and performance",
            exportCsv: 'Export CSV',
            totalRevenueWeekly: 'Total Revenue (Weekly)',
            totalWeeklyOrders: 'Total Weekly Orders',
            averageOrderValue: 'Average Order Value',
            fromLastWeek: 'from last week',
            salesVolume: 'sales volume',
            fromAverage: 'from average',
            revenueOverTime: 'Revenue Over Time',
            sevenDayAnalytics: '7-Day Analytics',
            categoryDistribution: 'Category Distribution',
            bestSellingProducts: 'Best Selling Products',
            totalSales: 'Total Sales',
            totalRevenue: 'Total Revenue',
            currentTrend: 'Current Trend',
            performanceScore: 'Performance Score',
            viewRankings: 'View Detailed Rankings'
        },
        users: {
            userManagement: 'User Management',
            manageStaff: 'Manage staff accounts and customer profiles',
            addNewUser: 'Add New User',
            editUser: 'Edit User',
            searchPlaceholder: 'Search by name or email...',
            allRoles: 'All Roles',
            user: 'User',
            role: 'Role',
            status: 'Status',
            contactInfo: 'Contact Info',
            joinedDate: 'Joined Date',
            noUsersFound: 'No users found matching your search.',
            fullName: 'Full Name',
            email: 'Email Address',
            password: 'Password',
            phone: 'Phone (Optional)',
            address: 'Address (Optional)',
            createUser: 'Create User',
            updating: 'Updating...',
            creating: 'Creating...',
            confirmDeletion: 'Confirm Account Deletion',
            deleteWarning: 'Warning: This action cannot be undone. All data associated with this user will be permanently removed.',
            understandPermanent: 'I confirm that I understand this action is permanent and I want to proceed.',
            deletePermanently: 'Delete Permanently'
        },
        inventory: {
            inventoryManagement: 'Inventory Management',
            monitorAndManage: 'Monitor and manage bakery ingredients and supplies',
            totalItems: 'Total Items',
            lowStock: 'Low Stock',
            categories: 'Categories',
            restocksToday: 'Restocks Today',
            addNewItem: 'Add New Item',
            searchPlaceholder: 'Search inventory items...',
            allCategories: 'All Categories',
            itemDetails: 'Item Details',
            category: 'Category',
            stockLevel: 'Stock Level',
            status: 'Status',
            lastRestock: 'Last Restock',
            editItem: 'Edit Item',
            outOfStock: 'Out of Stock',
            inStock: 'In Stock',
            itemName: 'Item Name',
            unit: 'Unit (kg, l, pcs...)',
            currentQuantity: 'Current Quantity',
            minStockAlert: 'Min. Stock Alert',
            newInventoryItem: 'New Inventory Item',
            editInventoryItem: 'Edit Inventory Item',
        },
        settings: {
            accountSettings: 'Account Settings',
            managePersonal: 'Manage your personal information and preferences',
            profile: 'Profile',
            notifications: 'Notifications',
            security: 'Security',
            coupons: 'My Coupons',
            fullName: 'Full Name',
            emailAddress: 'Email Address',
            phoneNumber: 'Phone Number',
            role: 'Role',
            address: 'Address',
            saveChanges: 'Save Changes',
            saving: 'Saving...',
            profileUpdated: 'Profile updated successfully!',
            profileUpdateFailed: 'Failed to update profile.',
        },
        notifications: {
            notificationsCenter: 'Notifications Center',
            stayUpdated: 'Stay updated with the latest bakery activity',
            markAllAsRead: 'Mark all as read',
            filterBy: 'Filter by',
            totalAlerts: 'alerts',
            noNotifications: 'No Notifications Found',
            caughtUp: "You're all caught up! Check back later for updates.",
            markAsRead: 'Mark as read',
        },
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
            maybeLater: '後で',
            paymentTitle: '安全な決済',
            selectPayment: 'お支払い方法を選択してください',
            payWithMoMo: 'MoMoで支払う',
            payWithZaloPay: 'ZaloPayで支払う',
            payWithCash: '店頭支払い (現金)',
            scanQR: 'QRコードをスキャンして支払いを完了してください',
            confirmPayment: '支払いを完了しました',
            processingPayment: '決済処理中...',
            paymentSuccess: '決済が完了しました！'
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
        },
        orders: {
            totalOrders: '注文総数',
            pending: '保留中',
            processing: '処理中',
            searchPlaceholder: '注文番号または顧客名で検索...',
            allStatus: 'すべてのステータス',
            orderId: '注文番号',
            customer: '顧客',
            date: '日付',
            items: '品目',
            total: '合計',
            status: 'ステータス',
            actions: 'アクション',
            noOrdersFound: '条件に一致する注文は見つかりませんでした',
            viewDetails: '詳細を表示',
            orderDetails: '注文詳細',
            placedOn: '注文日',
            updateStatus: 'ステータスを更新',
            startBaking: '調理開始',
            markReady: '準備完了',
            markCompleted: '完了にする',
            cancelOrder: '注文をキャンセル',
            orderFulfilled: '注文完了',
            orderCancelled: 'キャンセル済み',
            customerDetails: '顧客詳細',
            name: '名前',
            email: 'メールアドレス',
            phone: '電話番号',
            address: '住所',
            orderTimeline: '注文タイムライン',
            orderItems: '注文品目',
            product: '商品',
            qty: '数量',
            price: '単価',
            subtotal: '小計',
            notes: '備考'
        },
        products: {
            productManagement: '商品管理',
            addProduct: '商品を追加',
            editProduct: '商品を編集',
            updateProduct: '商品を更新',
            searchProducts: '商品を検索...',
            allCategories: 'すべてのカテゴリー',
            noProductsFound: '商品が見つかりませんでした。フィルターを調整してください。',
            price: '価格',
            stock: '在庫',
            productName: '商品名',
            category: 'カテゴリー',
            unit: '単位',
            description: '説明',
            rating: '評価',
            uploadImage: '画像をアップロード',
            orUseUrl: 'またはURLを使用'
        },
        reports: {
            analyticsReports: '分析とレポート',
            trackGrowth: 'ベーカリーの成長とパフォーマンスを追跡',
            exportCsv: 'CSVをエクスポート',
            totalRevenueWeekly: '週次総収益',
            totalWeeklyOrders: '週次注文総数',
            averageOrderValue: '平均注文金額',
            fromLastWeek: '先週比',
            salesVolume: '販売量',
            fromAverage: '平均比',
            revenueOverTime: '収益の推移',
            sevenDayAnalytics: '7日間の分析',
            categoryDistribution: 'カテゴリー分布',
            bestSellingProducts: '売筋商品',
            totalSales: '総販売数',
            totalRevenue: '総収益',
            currentTrend: '現在のトレンド',
            performanceScore: 'パフォーマンススコア',
            viewRankings: '詳細ランキングを表示'
        },
        users: {
            userManagement: 'ユーザー管理',
            manageStaff: 'スタッフアカウントと顧客プロフィールを管理',
            addNewUser: '新規ユーザーを追加',
            editUser: 'ユーザーを編集',
            searchPlaceholder: '名前またはメールアドレスで検索...',
            allRoles: 'すべての役割',
            user: 'ユーザー',
            role: '役割',
            status: 'ステータス',
            contactInfo: '連絡先情報',
            joinedDate: '登録日',
            noUsersFound: '検索条件に一致するユーザーは見つかりませんでした。',
            fullName: 'フルネーム',
            email: 'メールアドレス',
            password: 'パスワード',
            phone: '電話番号（任意）',
            address: '住所（任意）',
            createUser: 'ユーザーを作成',
            updating: '更新中...',
            creating: '作成中...',
            confirmDeletion: 'アカウント削除の確認',
            deleteWarning: '警告：この操作は取り消せません。このユーザーに関連するすべてのデータが完全に削除されます。',
            understandPermanent: 'この操作が永続的であることを理解し、続行することを確認します。',
            deletePermanently: '完全に削除する'
        },
        inventory: {
            inventoryManagement: '在庫管理',
            monitorAndManage: 'ベーカリーの原材料と備品の監視と管理',
            totalItems: '全アイテム数',
            lowStock: '在庫少',
            categories: 'カテゴリー',
            restocksToday: '本日の補充',
            addNewItem: '新規アイテム追加',
            searchPlaceholder: '在庫アイテムを検索...',
            allCategories: 'すべてのカテゴリー',
            itemDetails: 'アイテム詳細',
            category: 'カテゴリー',
            stockLevel: '在庫レベル',
            status: 'ステータス',
            lastRestock: '最終補充',
            editItem: 'アイテム編集',
            outOfStock: '在庫切れ',
            inStock: '在庫あり',
            itemName: 'アイテム名',
            unit: '単位 (kg, l, 個...)',
            currentQuantity: '現在の数量',
            minStockAlert: '最小在庫アラート',
            newInventoryItem: '新規在庫アイテム',
            editInventoryItem: '在庫アイテム編集',
        },
        settings: {
            accountSettings: 'アカウント設定',
            managePersonal: '個人情報と設定の管理',
            profile: 'プロフィール',
            notifications: '通知',
            security: 'セキュリティ',
            coupons: 'マイクーポン',
            fullName: '氏名',
            emailAddress: 'メールアドレス',
            phoneNumber: '電話番号',
            role: '役割',
            address: '住所',
            saveChanges: '変更を保存',
            saving: '保存中...',
            profileUpdated: 'プロフィールが更新されました！',
            profileUpdateFailed: 'プロフィールの更新に失敗しました。',
        },
        notifications: {
            notificationsCenter: '通知センター',
            stayUpdated: '最新のベーカリー活動を確認',
            markAllAsRead: 'すべて既読にする',
            filterBy: 'フィルター',
            totalAlerts: '件の通知',
            noNotifications: '通知はありません',
            caughtUp: 'すべて確認済みです！後で更新を確認してください。',
            markAsRead: '既読にする',
        },
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
            maybeLater: 'Để sau',
            paymentTitle: 'Thanh toán bảo mật',
            selectPayment: 'Chọn phương thức thanh toán của bạn',
            payWithMoMo: 'Thanh toán qua MoMo',
            payWithZaloPay: 'Thanh toán qua ZaloPay',
            payWithCash: 'Thanh toán tại quầy (Tiền mặt)',
            scanQR: 'Vui lòng quét mã QR để hoàn tất thanh toán',
            confirmPayment: 'Tôi đã hoàn tất thanh toán',
            processingPayment: 'Đang xử lý thanh toán...',
            paymentSuccess: 'Thanh toán thành công!'
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
        },
        orders: {
            totalOrders: 'Tổng Đơn Hàng',
            pending: 'Chờ xử lý',
            processing: 'Đang nấu',
            searchPlaceholder: 'Tìm mã đơn hoặc khách hàng...',
            allStatus: 'Tất cả trạng thái',
            orderId: 'Mã đơn hàng',
            customer: 'Khách hàng',
            date: 'Ngày đặt',
            items: 'Sản phẩm',
            total: 'Tổng cộng',
            status: 'Trạng thái',
            actions: 'Thao tác',
            noOrdersFound: 'Không tìm thấy đơn hàng nào phù hợp',
            viewDetails: 'Xem chi tiết',
            orderDetails: 'Chi tiết đơn hàng',
            placedOn: 'Đặt lúc',
            updateStatus: 'Cập nhật trạng thái',
            startBaking: 'Bắt đầu làm',
            markReady: 'Đã xong',
            markCompleted: 'Hoàn thành',
            cancelOrder: 'Hủy đơn hàng',
            orderFulfilled: 'Đã giao hàng',
            orderCancelled: 'Đã hủy đơn',
            customerDetails: 'Thông tin khách hàng',
            name: 'Họ tên',
            email: 'Email',
            phone: 'Số điện thoại',
            address: 'Địa chỉ',
            orderTimeline: 'Lịch sử đơn hàng',
            orderItems: 'Sản phẩm đã đặt',
            product: 'Sản phẩm',
            qty: 'SL',
            price: 'Giá',
            subtotal: 'Thành tiền',
            notes: 'Ghi chú'
        },
        products: {
            productManagement: 'Quản Lý Sản Phẩm',
            addProduct: 'Thêm sản phẩm',
            editProduct: 'Sửa sản phẩm',
            updateProduct: 'Cập nhật sản phẩm',
            searchProducts: 'Tìm kiếm sản phẩm...',
            allCategories: 'Tất cả danh mục',
            noProductsFound: 'Không tìm thấy sản phẩm. Hãy thử điều chỉnh bộ lọc.',
            price: 'Giá bán',
            stock: 'Kho hàng',
            productName: 'Tên sản phẩm',
            category: 'Danh mục',
            unit: 'Đơn vị',
            description: 'Mô tả',
            rating: 'Đánh giá',
            uploadImage: 'Tải ảnh sản phẩm',
            orUseUrl: 'Hoặc dùng URL'
        },
        reports: {
            analyticsReports: 'Phân Tích & Báo Cáo',
            trackGrowth: 'Theo dõi sự tăng trưởng và hiệu suất của cửa hàng',
            exportCsv: 'Xuất file CSV',
            totalRevenueWeekly: 'Doanh Thu Hàng Tuần',
            totalWeeklyOrders: 'Tổng Đơn Hàng Tuần',
            averageOrderValue: 'Giá Trị Đơn Trung Bình',
            fromLastWeek: 'so với tuần trước',
            salesVolume: 'lượng đơn hàng',
            fromAverage: 'so với trung bình',
            revenueOverTime: 'Doanh Thu Theo Thời Gian',
            sevenDayAnalytics: 'Phân tích 7 ngày',
            categoryDistribution: 'Phân Bổ Theo Danh Mục',
            bestSellingProducts: 'Sản Phẩm Bán Chạy',
            totalSales: 'Tổng Đã Bán',
            totalRevenue: 'Tổng Doanh Thu',
            currentTrend: 'Xu hướng',
            performanceScore: 'Điểm Hiệu Suất',
            viewRankings: 'Xem bảng xếp hạng chi tiết'
        },
        users: {
            userManagement: 'Quản Lý Người Dùng',
            manageStaff: 'Quản lý tài khoản nhân viên và hồ sơ khách hàng',
            addNewUser: 'Thêm người dùng mới',
            editUser: 'Sửa người dùng',
            searchPlaceholder: 'Tìm theo tên hoặc email...',
            allRoles: 'Tất cả vai trò',
            user: 'Người dùng',
            role: 'Vai trò',
            status: 'Trạng thái',
            contactInfo: 'Thông tin liên hệ',
            joinedDate: 'Ngày tham gia',
            noUsersFound: 'Không tìm thấy người dùng nào phù hợp.',
            fullName: 'Họ và tên',
            email: 'Địa chỉ Email',
            password: 'Mật khẩu',
            phone: 'Số điện thoại (tùy chọn)',
            address: 'Địa chỉ (tùy chọn)',
            createUser: 'Tạo người dùng',
            updating: 'Đang cập nhật...',
            creating: 'Đang tạo...',
            confirmDeletion: 'Xác Nhận Xóa Tài Khoản',
            deleteWarning: 'Cảnh báo: Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.',
            understandPermanent: 'Tôi xác nhận rằng mình hiểu hành động này là vĩnh viễn và muốn tiếp tục.',
            deletePermanently: 'Xóa vĩnh viễn'
        },
        inventory: {
            inventoryManagement: 'Quản lý kho',
            monitorAndManage: 'Theo dõi và quản lý nguyên liệu và vật tư bánh',
            totalItems: 'Tổng số mặt hàng',
            lowStock: 'Sắp hết hàng',
            categories: 'Danh mục',
            restocksToday: 'Nhập kho hôm nay',
            addNewItem: 'Thêm mặt hàng mới',
            searchPlaceholder: 'Tìm kiếm mặt hàng kho...',
            allCategories: 'Tất cả danh mục',
            itemDetails: 'Chi tiết mặt hàng',
            category: 'Danh mục',
            stockLevel: 'Mức tồn kho',
            status: 'Trạng thái',
            lastRestock: 'Lần nhập cuối',
            editItem: 'Sửa mặt hàng',
            outOfStock: 'Hết hàng',
            inStock: 'Còn hàng',
            itemName: 'Tên mặt hàng',
            unit: 'Đơn vị (kg, l, chiếc...)',
            currentQuantity: 'Số lượng hiện tại',
            minStockAlert: 'Cảnh báo tồn tối thiểu',
            newInventoryItem: 'Mặt hàng kho mới',
            editInventoryItem: 'Sửa mặt hàng kho',
        },
        settings: {
            accountSettings: 'Cài đặt tài khoản',
            managePersonal: 'Quản lý thông tin cá nhân và sở thích của bạn',
            profile: 'Hồ sơ',
            notifications: 'Thông báo',
            security: 'Bảo mật',
            coupons: 'Ưu đãi của tôi',
            fullName: 'Họ và tên',
            emailAddress: 'Địa chỉ Email',
            phoneNumber: 'Số điện thoại',
            role: 'Vai trò',
            address: 'Địa chỉ',
            saveChanges: 'Lưu thay đổi',
            saving: 'Đang lưu...',
            profileUpdated: 'Cập nhật hồ sơ thành công!',
            profileUpdateFailed: 'Cập nhật hồ sơ thất bại.',
        },
        notifications: {
            notificationsCenter: 'Trung tâm thông báo',
            stayUpdated: 'Cập nhật các hoạt động mới nhất của tiệm',
            markAllAsRead: 'Đánh dấu tất cả là đã đọc',
            filterBy: 'Lọc theo',
            totalAlerts: 'thông báo',
            noNotifications: 'Không có thông báo nào',
            caughtUp: 'Bạn đã xem hết thông báo! Hãy quay lại sau.',
            markAsRead: 'Đánh dấu đã đọc',
        },
    }
};
