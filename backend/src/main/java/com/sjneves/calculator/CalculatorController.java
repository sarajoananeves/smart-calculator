package com.sjneves.calculator;

import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalculatorController {

    private static final Set<String> VALID_OPERATORS = Set.of("+", "-", "*", "/");

    private final CalculatorService service;

    public CalculatorController(CalculatorService service) {
        this.service = service;
    }

    @PostMapping("/api/calculate")
    public ResponseEntity<CalculatorResponse> calculate(@RequestBody CalculateRequest req) {
        if (req.a() == null || req.b() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse(Messages.INVALID_NUMBERS));
        }
        if (req.op() == null || !VALID_OPERATORS.contains(req.op())) {
            return ResponseEntity.badRequest().body(new ErrorResponse(Messages.INVALID_OPERATOR));
        }

        try {
            double result = service.calculate(req.a(), req.b(), req.op());
            return ResponseEntity.ok(new CalculateResponse(result));
        } catch (ArithmeticException e) {
            return ResponseEntity.unprocessableEntity().body(new ErrorResponse(e.getMessage()));
        }
    }
}