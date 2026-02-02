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

{{- define "webscanner.ormName" -}}
{{ include "webscanner.name" . }}-orm
{{- end -}}

{{- define "webscanner.analyzerName" -}}
{{ include "webscanner.name" . }}-analyzer
{{- end -}}


