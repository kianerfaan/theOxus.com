#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <math.h>

#define NAPI_CALL(env, call)                                      \
  do {                                                            \
    napi_status status = (call);                                  \
    if (status != napi_ok) {                                      \
      const napi_extended_error_info* error_info = NULL;          \
      napi_get_last_error_info((env), &error_info);               \
      const char* err_message = error_info->error_message;        \
      bool is_pending;                                            \
      napi_is_exception_pending((env), &is_pending);              \
      if (!is_pending) {                                          \
        const char* message = (err_message == NULL)               \
            ? "empty error message"                               \
            : err_message;                                        \
        napi_throw_error((env), NULL, message);                   \
      }                                                           \
      return NULL;                                                \
    }                                                             \
  } while(0)

// Convert JavaScript date string to Unix timestamp
// Returns -1 if parsing fails
time_t parse_date_string(const char* date_str) {
    if (!date_str || strlen(date_str) == 0) {
        return -1;
    }
    
    struct tm tm = {0};
    char* result = NULL;
    
    // Try ISO 8601 format first (YYYY-MM-DDTHH:MM:SS.sssZ)
    result = strptime(date_str, "%Y-%m-%dT%H:%M:%S", &tm);
    if (!result) {
        // Try RFC 2822 format (Fri, 25 Dec 2020 12:00:00 GMT)
        result = strptime(date_str, "%a, %d %b %Y %H:%M:%S", &tm);
    }
    if (!result) {
        // Try simple format (YYYY-MM-DD HH:MM:SS)
        result = strptime(date_str, "%Y-%m-%d %H:%M:%S", &tm);
    }
    if (!result) {
        // Try date only (YYYY-MM-DD)
        result = strptime(date_str, "%Y-%m-%d", &tm);
    }
    
    if (!result) {
        return -1;
    }
    
    // Convert to UTC timestamp
    return timegm(&tm);
}

// Validates if a timestamp is within reasonable bounds
// Returns 1 if valid, 0 if invalid
int is_valid_article_date(time_t timestamp) {
    if (timestamp == -1) {
        return 0;
    }
    
    time_t now = time(NULL);
    time_t one_week_ago = now - (7 * 24 * 60 * 60);
    time_t one_hour_future = now + (60 * 60);
    
    return (timestamp >= one_week_ago && timestamp <= one_hour_future);
}

// C implementation of parseRSSDate
napi_value ParseRSSDate(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    NAPI_CALL(env, napi_get_cb_info(env, info, &argc, args, NULL, NULL));
    
    // Extract date strings from JavaScript
    char pub_date[256] = {0};
    char iso_date[256] = {0};
    size_t str_len;
    
    if (argc > 0) {
        napi_valuetype valuetype;
        NAPI_CALL(env, napi_typeof(env, args[0], &valuetype));
        if (valuetype == napi_string) {
            NAPI_CALL(env, napi_get_value_string_utf8(env, args[0], pub_date, sizeof(pub_date), &str_len));
        }
    }
    
    if (argc > 1) {
        napi_valuetype valuetype;
        NAPI_CALL(env, napi_typeof(env, args[1], &valuetype));
        if (valuetype == napi_string) {
            NAPI_CALL(env, napi_get_value_string_utf8(env, args[1], iso_date, sizeof(iso_date), &str_len));
        }
    }
    
    // Use pub_date if available, otherwise iso_date
    const char* date_to_parse = (strlen(pub_date) > 0) ? pub_date : iso_date;
    
    if (strlen(date_to_parse) == 0) {
        napi_value null_result;
        NAPI_CALL(env, napi_get_null(env, &null_result));
        return null_result;
    }
    
    time_t timestamp = parse_date_string(date_to_parse);
    
    if (!is_valid_article_date(timestamp)) {
        napi_value null_result;
        NAPI_CALL(env, napi_get_null(env, &null_result));
        return null_result;
    }
    
    // Convert to JavaScript Date (milliseconds since epoch)
    double js_timestamp = (double)timestamp * 1000.0;
    napi_value date_result;
    NAPI_CALL(env, napi_create_date(env, js_timestamp, &date_result));
    
    return date_result;
}

// Format relative time string
void format_relative_time(time_t timestamp, char* output, size_t output_size) {
    time_t now = time(NULL);
    double diff_seconds = difftime(now, timestamp);
    
    if (diff_seconds < 60) {
        snprintf(output, output_size, "Just now");
    } else if (diff_seconds < 3600) {
        int minutes = (int)(diff_seconds / 60);
        snprintf(output, output_size, "%d minute%s ago", minutes, minutes > 1 ? "s" : "");
    } else if (diff_seconds < 86400) {
        int hours = (int)(diff_seconds / 3600);
        snprintf(output, output_size, "%d hour%s ago", hours, hours > 1 ? "s" : "");
    } else if (diff_seconds < 604800) {
        int days = (int)(diff_seconds / 86400);
        snprintf(output, output_size, "%d day%s ago", days, days > 1 ? "s" : "");
    } else {
        struct tm* tm_info = localtime(&timestamp);
        strftime(output, output_size, "%m/%d/%Y", tm_info);
    }
}

// C implementation of formatArticleDate
napi_value FormatArticleDate(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    NAPI_CALL(env, napi_get_cb_info(env, info, &argc, args, NULL, NULL));
    
    if (argc < 1) {
        napi_value undefined;
        NAPI_CALL(env, napi_get_undefined(env, &undefined));
        return undefined;
    }
    
    // Get timestamp from JavaScript Date
    double js_timestamp;
    NAPI_CALL(env, napi_get_date_value(env, args[0], &js_timestamp));
    
    time_t timestamp = (time_t)(js_timestamp / 1000.0);
    
    char formatted_time[256];
    format_relative_time(timestamp, formatted_time, sizeof(formatted_time));
    
    napi_value result;
    NAPI_CALL(env, napi_create_string_utf8(env, formatted_time, NAPI_AUTO_LENGTH, &result));
    
    return result;
}

// Check if timestamp is within time window (in hours)
int is_within_time_window(time_t timestamp, int hours) {
    time_t now = time(NULL);
    time_t cutoff = now - (hours * 3600);
    return timestamp >= cutoff;
}

// C implementation of filterRecentArticles core logic
napi_value FilterByTimeWindow(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    NAPI_CALL(env, napi_get_cb_info(env, info, &argc, args, NULL, NULL));
    
    if (argc < 2) {
        napi_value undefined;
        NAPI_CALL(env, napi_get_undefined(env, &undefined));
        return undefined;
    }
    
    // Get array of timestamps and time window in hours
    napi_value timestamps_array = args[0];
    
    double hours_double;
    NAPI_CALL(env, napi_get_value_double(env, args[1], &hours_double));
    int hours = (int)hours_double;
    
    // Get array length
    uint32_t array_length;
    NAPI_CALL(env, napi_get_array_length(env, timestamps_array, &array_length));
    
    // Create result array for valid indices
    napi_value result_array;
    NAPI_CALL(env, napi_create_array(env, &result_array));
    
    uint32_t result_index = 0;
    
    for (uint32_t i = 0; i < array_length; i++) {
        napi_value timestamp_value;
        NAPI_CALL(env, napi_get_element(env, timestamps_array, i, &timestamp_value));
        
        // Check if it's a valid number (timestamp)
        napi_valuetype valuetype;
        NAPI_CALL(env, napi_typeof(env, timestamp_value, &valuetype));
        
        if (valuetype == napi_number) {
            double js_timestamp;
            NAPI_CALL(env, napi_get_value_double(env, timestamp_value, &js_timestamp));
            
            time_t timestamp = (time_t)(js_timestamp / 1000.0);
            
            if (is_within_time_window(timestamp, hours)) {
                napi_value index_value;
                NAPI_CALL(env, napi_create_uint32(env, i, &index_value));
                NAPI_CALL(env, napi_set_element(env, result_array, result_index++, index_value));
            }
        }
    }
    
    return result_array;
}

// Initialize the module
napi_value Init(napi_env env, napi_value exports) {
    napi_value parse_rss_date_fn;
    NAPI_CALL(env, napi_create_function(env, NULL, 0, ParseRSSDate, NULL, &parse_rss_date_fn));
    NAPI_CALL(env, napi_set_named_property(env, exports, "parseRSSDate", parse_rss_date_fn));
    
    napi_value format_article_date_fn;
    NAPI_CALL(env, napi_create_function(env, NULL, 0, FormatArticleDate, NULL, &format_article_date_fn));
    NAPI_CALL(env, napi_set_named_property(env, exports, "formatArticleDate", format_article_date_fn));
    
    napi_value filter_by_time_window_fn;
    NAPI_CALL(env, napi_create_function(env, NULL, 0, FilterByTimeWindow, NULL, &filter_by_time_window_fn));
    NAPI_CALL(env, napi_set_named_property(env, exports, "filterByTimeWindow", filter_by_time_window_fn));
    
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)