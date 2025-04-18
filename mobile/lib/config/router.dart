import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:mobile/features/login/presentation/pages/login_page.dart';
import 'package:mobile/features/login/presentation/view_model/login_form.dart';

final GoRouter router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      name: 'login',
      builder:
          (context, state) => ChangeNotifierProvider(
            create: (context) => LoginViewModel(),
            child: LoginPage(),
          ),
    ),
  ],
);
