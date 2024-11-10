ffmpeg -loglevel verbose -f avfoundation -framerate 30 -video_size 1280x720 -i "2:2" -r 30 -codec:v libx264 -preset ultrafast \
-f hls -hls_time 2 -hls_list_size 10 -hls_flags delete_segments \
-hls_segment_filename "hls_output/output%03d.ts" "hls_output/stream.m3u8"
