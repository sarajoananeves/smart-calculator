package com.sjneves.calculator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ParserController {

    private final ExpressionParser parser;

    public ParserController(ExpressionParser parser) {
        this.parser = parser;
    }

    @PostMapping("/api/parse")
    public ResponseEntity<ParserResponse> parse(@RequestBody ParseRequest req) {
        if (req.expression() == null || req.expression().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(Messages.PLEASE_ENTER_EXPRESSION));
        }

        try {
            ParseResponse response = parser.parse(req.expression());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}