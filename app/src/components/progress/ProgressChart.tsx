import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Card from "../ui/Card";

interface DataPoint {
  date: Date;
  value: number;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
}

export default function ProgressChart({
  title,
  data,
  unit = "lbs",
  color = "#6366F1",
}: ProgressChartProps) {
  if (data.length < 2) {
    return (
      <Card className="mb-3">
        <Text className="text-white text-base font-bold mb-2">{title}</Text>
        <Text className="text-dark-400 text-sm text-center py-8">
          Need at least 2 data points to show chart
        </Text>
      </Card>
    );
  }

  const screenWidth = Dimensions.get("window").width - 48;

  // Take last 10 data points max for readability
  const displayData = data.slice(-10);
  const labels = displayData.map((d) => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  return (
    <Card className="mb-3" padding="sm">
      <Text className="text-white text-base font-bold mb-3 px-2">{title}</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: displayData.map((d) => d.value) }],
        }}
        width={screenWidth}
        height={200}
        yAxisSuffix={` ${unit}`}
        chartConfig={{
          backgroundColor: "#1E293B",
          backgroundGradientFrom: "#1E293B",
          backgroundGradientTo: "#1E293B",
          decimalPlaces: 0,
          color: () => color,
          labelColor: () => "#64748B",
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: color,
          },
          propsForBackgroundLines: {
            stroke: "#334155",
            strokeDasharray: "5,5",
          },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </Card>
  );
}
