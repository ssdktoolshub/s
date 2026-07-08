// SSDK BMI Calculator Tool Module
// Computes Body Mass Index and parses weight status category results.

import { SSDKTool } from "../core/sdk.js";
import { GlassComponents } from "../components/glass-components.js";

export default class BMICalculator extends SSDKTool {
  constructor() {
    super();
  }

  async init(toolEngine) {
    this.engine = toolEngine;

    const inputsContainer = document.getElementById("tool-inputs-container");
    const optionsContainer = document.getElementById("tool-options-container");
    const outputsContainer = document.getElementById("tool-outputs-container");

    inputsContainer.innerHTML = "";
    optionsContainer.innerHTML = "";
    outputsContainer.innerHTML = "";

    // 1. Create Weight (kg) Input
    const weightInput = GlassComponents.createInput(
      "bmiWeight",
      "number",
      "Enter weight in kilograms (e.g. 70)...",
      "Weight (kg)",
      "",
      true
    );
    inputsContainer.appendChild(weightInput);

    // 2. Create Height (cm) Input
    const heightInput = GlassComponents.createInput(
      "bmiHeight",
      "number",
      "Enter height in centimeters (e.g. 175)...",
      "Height (cm)",
      "",
      true
    );
    inputsContainer.appendChild(heightInput);

    // 3. Create standard output result
    const outputArea = GlassComponents.createTextarea(
      "toolOutput",
      "Configure weight and height parameters to analyze health index...",
      "BMI Calculations & Category Report"
    );
    outputsContainer.appendChild(outputArea);
    document.getElementById("toolOutput").readOnly = true;
  }

  async run(toolEngine) {
    const weightVal = parseFloat(this.getInputValue("bmiWeight"));
    const heightVal = parseFloat(this.getInputValue("bmiHeight"));

    if (isNaN(weightVal) || weightVal <= 0) {
      this.showStatus("❌ Please enter a valid positive Weight.", true);
      return;
    }

    if (isNaN(heightVal) || heightVal <= 0) {
      this.showStatus("❌ Please enter a valid positive Height.", true);
      return;
    }

    this.showProgress(true, "Analyzing BMI index...");
    await new Promise(resolve => setTimeout(resolve, 400));

    // Convert height to meters
    const heightMeters = heightVal / 100;
    const bmi = weightVal / (heightMeters * heightMeters);

    let category = "";
    let color = "";
    if (bmi < 18.5) {
      category = "Underweight 🔵";
      color = "#60a5fa";
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal Weight (Healthy) 🟢";
      color = "#34d399";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight 🟡";
      color = "#fbbf24";
    } else {
      category = "Obese 🔴";
      color = "#f87171";
    }

    // Ideal weight ranges (BMI 18.5 to 24.9)
    const minIdealWeight = 18.5 * (heightMeters * heightMeters);
    const maxIdealWeight = 24.9 * (heightMeters * heightMeters);

    const report = `--- BMI ANALYSIS REPORT ---
Your height: ${heightVal} cm (${heightMeters.toFixed(2)} m)
Your weight: ${weightVal} kg

Body Mass Index (BMI): ${bmi.toFixed(1)}
Weight Status Category: ${category}

Ideal Weight Range for your height:
• Min (Healthy) : ${minIdealWeight.toFixed(1)} kg
• Max (Healthy) : ${maxIdealWeight.toFixed(1)} kg
`;

    this.setOutputValue(report, "toolOutput");
    this.showProgress(false);
    this.showStatus(`✅ Analysis complete: BMI ${bmi.toFixed(1)} (${category})`);
  }
}
