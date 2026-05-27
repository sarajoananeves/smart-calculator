package com.sjneves.calculator;

import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ParserController.class)
class ParserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExpressionParser parser;

    @Test
    @DisplayName("[CALC-500] should call parser with expression")
    void shouldCallParserWithExpression() throws Exception {
        when(parser.parse("7 plus 3")).thenReturn(new ParseResponse(7.0, 3.0, "+"));

        mockMvc.perform(post("/api/parse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expression\": \"7 plus 3\"}"))
                .andExpect(status().isOk());

        verify(parser).parse("7 plus 3");
    }

    @Test
    @DisplayName("[CALC-501] should return parser response on success")
    void shouldReturnParseResponseOnSuccess() throws Exception {
        when(parser.parse("7 plus 3")).thenReturn(new ParseResponse(7.0, 3.0, "+"));

        mockMvc.perform(post("/api/parse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expression\": \"7 plus 3\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.a").value(7.0))
                .andExpect(jsonPath("$.b").value(3.0))
                .andExpect(jsonPath("$.op").value("+"));
    }

    static Stream<Arguments> invalidExpressions() {
        return Stream.of(
                Arguments.of("null",    "{\"expression\": null}"),
                Arguments.of("blank",   "{\"expression\": \"   \"}"),
                Arguments.of("missing", "{}")
        );
    }

    @ParameterizedTest(name = "[CALC-502] returns 400 when expression is {0}")
    @MethodSource("invalidExpressions")
    void shouldReturn400WhenExpressionIsInvalid(String scenario, String requestBody) throws Exception {
        mockMvc.perform(post("/api/parse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.PLEASE_ENTER_EXPRESSION));

        verify(parser, never()).parse(any());
    }

    @Test
    @DisplayName("[CALC-503] should return 400 when parser throws")
    void shouldReturn400WhenParserThrows() throws Exception {
        when(parser.parse("gibberish"))
                .thenThrow(new IllegalArgumentException(Messages.COULD_NOT_PARSE));

        mockMvc.perform(post("/api/parse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expression\": \"gibberish\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.COULD_NOT_PARSE));
    }
}