import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:flutter/material.dart';
class PaywallScreen extends StatelessWidget {
  const PaywallScreen({super.key});
  @override
  Widget build(BuildContext context) => const Column(children: [
    Text('Penny Plus'),
    Text('Unlimited budgets and categories'),
    Text('Bill reminders before every due date'),
    Text('Home screen widget for your balance'),
    Text('Face ID lock for your data'),
  ]);
}
