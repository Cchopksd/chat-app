import 'package:flutter/material.dart';

class LoginViewModel extends ChangeNotifier {
  final formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  String? errorMessage;
  bool isLoading = false;
  bool rememberMe = false;
  bool isPasswordVisible = false;

  void setEmail(String value) {
    // อาจจะมีการ validate เพิ่มเติมในระหว่างการพิมพ์
    notifyListeners();
  }

  void setPassword(String value) {
    // อาจจะมีการ validate เพิ่มเติมในระหว่างการพิมพ์
    notifyListeners();
  }

  void setRememberMe(bool value) {
    rememberMe = value;
    notifyListeners();
  }

  void togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
    notifyListeners();
  }

  String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'กรุณากรอกอีเมล';
    }

    // ตรวจสอบรูปแบบอีเมลโดยใช้ regex
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    return null;
  }

  String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'กรุณากรอกรหัสผ่าน';
    }

    if (value.length < 6) {
      return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    return null;
  }

  Future<void> login() async {
    if (!formKey.currentState!.validate()) {
      return;
    }

    errorMessage = null;
    isLoading = true;
    notifyListeners();

    try {
      // เชื่อมต่อกับ API เพื่อ login
      await Future.delayed(Duration(seconds: 2)); // จำลองการเรียก API

      // บันทึกข้อมูลการ login หากเลือก remember me
      if (rememberMe) {
        // บันทึกข้อมูลการ login ลงใน shared preferences หรือ secure storage
      }

      // เมื่อ login สำเร็จให้นำทางไปยังหน้าหลัก
      // navigationService.navigateTo('/home');
    } catch (e) {
      errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${e.toString()}';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void forgotPassword() {
    // นำทางไปยังหน้า forgot password
    // navigationService.navigateTo('/forgot-password');
  }

  void socialLogin(String provider) {
    // ดำเนินการเข้าสู่ระบบด้วย social media
    print('Logging in with $provider');
    // สำหรับการเชื่อมต่อกับ Firebase Auth หรือ OAuth providers
  }

  void navigateToRegister() {
    // นำทางไปยังหน้าลงทะเบียน
    // navigationService.navigateTo('/register');
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }
}
