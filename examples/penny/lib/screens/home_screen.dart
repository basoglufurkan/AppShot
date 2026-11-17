import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Column(children: const [
      Text('Left to spend this month'),
      Text('Spending by category'),
      Text('Upcoming bills'),
    ]);
  }
}
