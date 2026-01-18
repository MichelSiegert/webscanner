{{- define "webscanner.name" -}}
webscanner
{{- end -}}

{{- define "webscanner.frontendName" -}}
{{ include "webscanner.name" . }}-frontend
{{- end -}}

{{- define "webscanner.emailName" -}}
{{ include "webscanner.name" . }}-email
{{- end -}}

{{- define "webscanner.crawlerName" -}}
{{ include "webscanner.name" . }}-crawler
{{- end -}}


