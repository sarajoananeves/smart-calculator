package com.sjneves.calculator;

public sealed interface CalculatorResponse
        permits CalculateResponse, ErrorResponse {}