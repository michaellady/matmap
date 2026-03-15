import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  color: string;
  size?: number;
}

export function HeatmapCell({ color, size = 28 }: Props) {
  return (
    <View
      style={[
        styles.cell,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: 4,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    margin: 2,
  },
});
