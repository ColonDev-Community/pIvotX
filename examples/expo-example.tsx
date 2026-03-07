/**
 * pIvotX — Expo / React Native Example
 *
 * Shows both JSX mode and Script mode in a single screen.
 *
 * Install:
 *   npx create-expo-app my-game
 *   cd my-game
 *   npm install @colon-dev/pivotx react-native-webview
 *   npx expo install react-native-webview
 *
 * Replace App.tsx with this file and run:
 *   npx expo start
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import {
  PivotNativeCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  useNativeGameLoop,
} from '@colon-dev/pivotx/react-native';

// ─── JSX Mode ────────────────────────────────────────────────────────────────

function JSXModeDemo() {
  const ball = useRef({ x: 200, y: 150, vx: 180, vy: 130 });
  const [, tick] = useState(0);

  useNativeGameLoop((dt) => {
    const b = ball.current;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < 20 || b.x > 380) b.vx *= -1;
    if (b.y < 20 || b.y > 280) b.vy *= -1;
    tick((n) => n + 1);
  });

  return (
    <PivotNativeCanvas width={400} height={300} background="#1a1a2e">
      {/* Background */}
      <PivotRectangle
        position={{ x: 0, y: 0 }}
        width={400}
        height={300}
        fill="#1a1a2e"
      />

      {/* Bouncing ball */}
      <PivotCircle
        center={{ x: ball.current.x, y: ball.current.y }}
        radius={20}
        fill="#e94560"
        stroke="white"
        lineWidth={2}
      />

      {/* Title */}
      <PivotLabel
        text="JSX Mode"
        position={{ x: 200, y: 20 }}
        font="16px monospace"
        fill="#ffffff"
      />
    </PivotNativeCanvas>
  );
}

// ─── Script Mode ─────────────────────────────────────────────────────────────

const gameScript = `
  var Canvas = PivotX.Canvas;
  var Circle = PivotX.Circle;
  var Rectangle = PivotX.Rectangle;
  var Label = PivotX.Label;
  var Point = PivotX.Point;

  var canvas = new Canvas("game");
  var W = 400, H = 300;

  var balls = [];
  for (var i = 0; i < 5; i++) {
    balls.push({
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 200,
      vx: 80 + Math.random() * 120,
      vy: 60 + Math.random() * 100,
      r: 10 + Math.random() * 15,
      color: ["#e94560","#0f3460","#16213e","#53d769","#ffd93d"][i]
    });
  }

  canvas.startLoop(function(dt) {
    canvas.clear();

    var bg = new Rectangle(Point(0, 0), W, H);
    bg.fillColor = "#0a0a1a";
    canvas.add(bg);

    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < b.r || b.x > W - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > H - b.r) b.vy *= -1;

      var c = new Circle(Point(b.x, b.y), b.r);
      c.fillColor = b.color;
      canvas.add(c);
    }

    var lbl = new Label(Point(200, 20), "Script Mode");
    lbl.font = "16px monospace";
    lbl.fillColor = "#ffffff";
    canvas.add(lbl);
  });
`;

function ScriptModeDemo() {
  return (
    <PivotNativeCanvas width={400} height={300} script={gameScript} />
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>pIvotX — Expo Demo</Text>

        <Text style={styles.sectionTitle}>1. JSX Mode (state-driven)</Text>
        <JSXModeDemo />

        <Text style={styles.sectionTitle}>2. Script Mode (60fps in WebView)</Text>
        <ScriptModeDemo />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scroll:    { alignItems: 'center', padding: 20, gap: 16 },
  title:     { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  sectionTitle: { fontSize: 14, color: '#aaa', marginTop: 12 },
});
