export interface AndroidProjectFile {
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown';
  description: string;
  content: string;
}

export function getAndroidNativeProjectFiles(): AndroidProjectFile[] {
  return [
    {
      path: 'app/build.gradle.kts',
      language: 'kotlin',
      description: 'Cấu hình Gradle cấp ứng dụng (Dependencies: Compose, Room, WorkManager, Material 3)',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
}

android {
    namespace = "vn.petflow.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "vn.petflow.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 102
        versionName = "1.0.2"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.15"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.navigation:navigation-compose:2.8.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    // WorkManager for Local Reminders & Notifications
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // Coroutines & Coil for Image Loading
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}`
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      description: 'Quyền thông báo, báo thức chính xác và khai báo Activity',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:name=".PetFlowApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PetFlow">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.PetFlow">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Receiver for exact scheduled alarms (Appointment & Vaccine reminders) -->
        <receiver
            android:name=".receiver.PetFlowAlarmReceiver"
            android:enabled="true"
            android:exported="false" />
    </application>

</manifest>`
    },
    {
      path: 'app/src/main/java/vn/petflow/app/data/local/PetFlowEntities.kt',
      language: 'kotlin',
      description: 'Mô hình thực thể Room Database cho Khách hàng, Thú cưng, Hàng hóa, Hóa đơn, Lịch hẹn',
      content: `package vn.petflow.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey val id: String,
    val code: String,
    val fullName: String,
    val province: String,
    val ward: String,
    val streetDetail: String,
    val phoneNumber: String,
    val email: String,
    val createdAt: Long = System.currentTimeMillis(),
    val isDeleted: Boolean = false
)

@Entity(
    tableName = "pets",
    foreignKeys = [
        ForeignKey(
            entity = CustomerEntity::class,
            parentColumns = ["id"],
            childColumns = ["customerId"],
            onDelete = ForeignKey.RESTRICT
        )
    ],
    indices = [Index(value = ["customerId"])]
)
data class PetEntity(
    @PrimaryKey val id: String,
    val customerId: String,
    val species: String, // 'Chó' | 'Mèo'
    val name: String,
    val breed: String,
    val gender: String, // 'Đực' | 'Cái'
    val neutered: String, // 'Chưa triệt sản' | 'Đã triệt sản'
    val weightKg: Double,
    val dob: String, // YYYY-MM-DD
    val identificationNotes: String?,
    val color: String?,
    val photoUrl: String,
    val isDeleted: Boolean = false
)

@Entity(
    tableName = "vaccination_records",
    foreignKeys = [
        ForeignKey(
            entity = PetEntity::class,
            parentColumns = ["id"],
            childColumns = ["petId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["petId"])]
)
data class VaccinationEntity(
    @PrimaryKey val id: String,
    val petId: String,
    val vaccineType: String,
    val vaccinationDate: String, // YYYY-MM-DD
    val validityYears: Int,
    val certificatePhotoUrl: String,
    val notes: String?,
    val nextDueDate: String?, // YYYY-MM-DD
    val isDeleted: Boolean = false
)

@Entity(tableName = "catalog_items")
data class CatalogEntity(
    @PrimaryKey val id: String,
    val code: String,
    val name: String,
    val type: String, // 'GOODS' | 'SERVICE'
    val groupName: String, // 'Thức ăn', 'Chăm sóc body', 'Tiêm chủng', 'Dịch vụ'
    val subType: String?,
    val costPrice: Long,
    val sellingPrice: Long,
    val status: String, // 'ACTIVE' | 'DISCONTINUED'
    val supplierId: String?,
    val expiryDate: String?,
    val durationMinutes: Int?,
    val stockQuantity: Int = 0,
    val isDeleted: Boolean = false
)

@Entity(tableName = "invoices")
data class InvoiceEntity(
    @PrimaryKey val id: String,
    val invoiceCode: String, // HDYYYYMMDDnnn (UNIQUE)
    val customerId: String,
    val customerNameSnapshot: String,
    val customerPhoneSnapshot: String,
    val isRetailCustomer: Boolean = false,
    val appointmentId: String?,
    val completedAt: Long,
    val subtotal: Long,
    val totalDiscount: Long,
    val otherCharge: Long,
    val totalPayable: Long,
    val paidAmount: Long,
    val status: String = "COMPLETED"
)

@Entity(tableName = "invoice_lines")
data class InvoiceLineEntity(
    @PrimaryKey val id: String,
    val invoiceId: String,
    val itemId: String?,
    val itemNameSnapshot: String,
    val itemTypeSnapshot: String,
    val quantity: Int,
    val unitPriceSnapshot: Long,
    val discount: Long,
    val lineTotal: Long,
    val costPriceSnapshot: Long
)

@Entity(tableName = "appointments")
data class AppointmentEntity(
    @PrimaryKey val id: String,
    val customerId: String,
    val customerName: String,
    val customerPhone: String,
    val startDateTime: String,
    val durationMinutes: Int,
    val notes: String?,
    val isCanceled: Boolean = false,
    val linkedInvoiceId: String? = null
)`
    },
    {
      path: 'app/src/main/java/vn/petflow/app/data/local/PetFlowDaos.kt',
      language: 'kotlin',
      description: 'Lớp truy xuất dữ liệu Room DAOs với Transaction hoàn thành hóa đơn và trừ kho',
      content: `package vn.petflow.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PetFlowDao {
    @Query("SELECT * FROM customers WHERE isDeleted = 0 ORDER BY fullName ASC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Query("SELECT * FROM pets WHERE customerId = :customerId AND isDeleted = 0")
    fun getPetsByCustomer(customerId: String): Flow<List<PetEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPet(pet: PetEntity)

    @Query("SELECT * FROM vaccination_records WHERE petId = :petId AND isDeleted = 0 ORDER BY vaccinationDate DESC")
    fun getVaccinations(petId: String): Flow<List<VaccinationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVaccination(vac: VaccinationEntity)

    @Query("SELECT * FROM catalog_items WHERE isDeleted = 0 ORDER BY name ASC")
    fun getCatalog(): Flow<List<CatalogEntity>>

    @Query("SELECT * FROM catalog_items WHERE id = :id LIMIT 1")
    suspend fun getCatalogItemById(id: String): CatalogEntity?

    @Query("UPDATE catalog_items SET stockQuantity = stockQuantity - :qty WHERE id = :itemId")
    suspend fun deductStock(itemId: String, qty: Int)

    @Query("SELECT * FROM invoices ORDER BY completedAt DESC")
    fun getAllInvoices(): Flow<List<InvoiceEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertInvoice(invoice: InvoiceEntity)

    @Insert
    suspend fun insertInvoiceLines(lines: List<InvoiceLineEntity>)

    @Query("UPDATE appointments SET linkedInvoiceId = :invoiceId WHERE id = :appointmentId")
    suspend fun linkAppointmentInvoice(appointmentId: String, invoiceId: String)

    /**
     * Giao dịch hoàn thành hóa đơn nguyên tử (Atomic Transaction):
     * 1. Ghi hóa đơn
     * 2. Ghi chi tiết dòng hóa đơn
     * 3. Trừ kho hàng hóa
     * 4. Gắn liên kết lịch hẹn nếu có
     */
    @Transaction
    suspend fun completeInvoiceTransaction(
        invoice: InvoiceEntity,
        lines: List<InvoiceLineEntity>,
        stockDeductions: List<Pair<String, Int>>,
        appointmentId: String?
    ) {
        insertInvoice(invoice)
        insertInvoiceLines(lines)
        for ((itemId, qty) in stockDeductions) {
            deductStock(itemId, qty)
        }
        if (appointmentId != null) {
            linkAppointmentInvoice(appointmentId, invoice.id)
        }
    }
}`
    },
    {
      path: 'app/src/main/java/vn/petflow/app/notification/PetFlowNotificationManager.kt',
      language: 'kotlin',
      description: 'Quản lý thông báo Android NotificationChannel và BroadcastReceiver',
      content: `package vn.petflow.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import vn.petflow.app.MainActivity

object PetFlowNotificationManager {
    const val CHANNEL_APPOINTMENTS = "petflow_appointments"
    const val CHANNEL_VACCINES = "petflow_vaccines"
    const val CHANNEL_STOCK = "petflow_stock"

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val chApt = NotificationChannel(
                CHANNEL_APPOINTMENTS,
                "Nhắc Lịch Hẹn",
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "Thông báo nhắc hẹn khách đến spa trước 30 phút" }

            val chVac = NotificationChannel(
                CHANNEL_VACCINES,
                "Nhắc Tiêm Chủng",
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "Thông báo lịch tiêm sắp đến và quá hạn" }

            val chStock = NotificationChannel(
                CHANNEL_STOCK,
                "Cảnh Báo Tồn Kho",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply { description = "Cảnh báo hết hàng, sắp hết hàng và tồn âm" }

            manager.createNotificationChannels(listOf(chApt, chVac, chStock))
        }
    }

    fun showNotification(
        context: Context,
        notificationId: Int,
        channelId: String,
        title: String,
        message: String
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(notificationId, builder.build())
    }
}`
    },
    {
      path: 'HUONG_DAN_BUILD_ANDROID.md',
      language: 'markdown',
      description: 'Hướng dẫn cài đặt, cấu hình, build APK và chạy trên thiết bị Android',
      content: `# HƯỚNG DẪN BUILD VÀ CÀI ĐẶT ỨNG DỤNG ANDROID PETFLOW (v1.0.2)

Tài liệu này hướng dẫn chi tiết cách build mã nguồn Android nguyên bản (Native Kotlin + Jetpack Compose) của PetFlow từ Android Studio.

## 1. YÊU CẦU MÔI TRƯỜNG
- **Hệ điều hành**: Windows 10/11, macOS hoặc Linux.
- **Android Studio**: Android Studio Koala / Ladybug hoặc mới hơn (JDK 17 tích hợp).
- **Android SDK**: Compile SDK 35, Min SDK 26 (Android 8.0 Oreo trở lên).
- **Thiết bị thật hoặc Máy ảo (Emulator)**: Pixel 7 / Galaxy S24 chạy Android 12 - 15.

## 2. CÁC BƯỚC MỞ VÀ BUILD DỰ ÁN
1. Mở **Android Studio** -> Chọn **Open** -> Điều hướng đến thư mục mã nguồn Android.
2. Chờ Gradle đồng bộ tự động (**Gradle Sync**). Đảm bảo kết nối mạng ổn định để tải các thư viện Jetpack Compose, Room và WorkManager.
3. Để chạy thử:
   - Kết nối điện thoại Android qua cáp USB (đã bật **USB Debugging** trong Cài đặt nhà phát triển).
   - Chọn thiết bị trên thanh công cụ và bấm nút **Run (Shift + F10)**.
4. Để xuất file APK cài đặt:
   - Vào menu: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Khi build xong, thông báo xuất hiện ở góc dưới bên phải, bấm **locate** để lấy file \`app-debug.apk\`.
   - Chuyển file APK vào điện thoại và bấm cài đặt.

## 3. CẤU HÌNH DỊCH VỤ NGOÀI (NẾU DÙNG BACKEND / FIREBASE)
Nếu quý khách muốn đồng bộ dữ liệu đám mây đa thiết bị:
1. Tạo một dự án trên [Firebase Console](https://console.firebase.google.com).
2. Thêm ứng dụng Android với Package Name: \`vn.petflow.app\`.
3. Tải file \`google-services.json\` đặt vào thư mục \`app/\`.
4. Bật Firestore Database và thiết lập Rule theo quyền chủ sở hữu cửa hàng.

## 4. TÀI KHOẢN MẪU ĐĂNG NHẬP
- **Số điện thoại**: \`0901234567\`
- **Email**: \`admin@petflow.vn\`
- **Mật khẩu**: \`Password@123\` (Đáp ứng chuẩn: chữ hoa, chữ thường, số, ký tự đặc biệt, >= 8 ký tự).`
    }
  ];
}
