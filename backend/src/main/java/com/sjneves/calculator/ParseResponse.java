package com.sjneves.calculator;

public record ParseResponse(Double a, Double b, String op) implements ParserResponse {}