'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Trash2, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  existingCv: { filename: string; createdAt: string } | null
}

export function ProfileCvUpload({ existingCv }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) { setError('Seuls les fichiers PDF et DOCX sont acceptés.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Le fichier doit faire moins de 10 Mo.'); return }

    setUploading(true)
    setError('')
    setSuccess(false)

    const form = new FormData()
    form.append('cv', file)

    try {
      const res = await fetch('/api/profile/cv', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur lors de l\'upload.'); return }
      setSuccess(true)
      router.refresh()
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await fetch('/api/profile/cv', { method: 'DELETE' })
      router.refresh()
    } catch {
      setError('Erreur lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  const uploadDate = existingCv
    ? new Date(existingCv.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // CV existant
  if (existingCv && !success) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 p-3 bg-[#EEF2FF] rounded-xl border border-[#C7D2FE]">
          <div className="w-9 h-9 rounded-lg bg-[#1B4FFF] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0F172A] truncate">{existingCv.filename}</p>
            <p className="text-[12px] text-[#64748B]">Uploadé le {uploadDate}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] text-[12px] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Remplacer
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#FECACA] text-[#EF4444] text-[12px] font-medium rounded-lg hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Supprimer
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
      </div>
    )
  }

  // Aucun CV ou upload réussi
  return (
    <div className="flex flex-col gap-3">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#E6FBF3] rounded-xl border border-[#00C97A]/30">
          <CheckCircle className="w-4 h-4 text-[#00C97A] shrink-0" />
          <p className="text-[13px] text-[#00A362] font-medium">CV de profil mis à jour avec succès !</p>
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-[#E2E8F0] rounded-xl text-[#64748B] hover:border-[#1B4FFF] hover:bg-[#EEF2FF] hover:text-[#1B4FFF] transition-colors disabled:opacity-50"
      >
        {uploading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours…</>
          : <><Upload className="w-4 h-4" /> <span className="text-[13px] font-medium">Uploader mon CV (PDF ou DOCX, max 10 Mo)</span></>
        }
      </button>

      <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
    </div>
  )
}
