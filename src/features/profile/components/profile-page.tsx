import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type RefObject,
} from 'react'

import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { AppSelect } from '@/components/ui/app-select'
import { BannerWrapper } from '@/components/ui/banner-wrapper'
import { Icon } from '@/components/ui/icon'
import { demoProfessionalProfile } from '@/data/profile-data'
import { useProfileStore } from '@/stores/profile-store'
import type { ProfessionalProfile } from '@/types/profile'

type ProfileFieldKey = Exclude<keyof ProfessionalProfile, 'photoUrl'>
type ProfileTextFieldKey = Exclude<ProfileFieldKey, 'profession'>

type ProfileFieldConfig = {
  key: ProfileTextFieldKey
  label: string
  type: InputHTMLAttributes<HTMLInputElement>['type']
  autoComplete: string
  placeholder: string
}

const profileIdentityFieldConfig: ProfileFieldConfig[] = [
  {
    key: 'firstName',
    label: 'Nombres',
    type: 'text',
    autoComplete: 'given-name',
    placeholder: 'Ej. Alex',
  },
  {
    key: 'lastName',
    label: 'Apellidos',
    type: 'text',
    autoComplete: 'family-name',
    placeholder: 'Ej. González',
  },
  {
    key: 'rut',
    label: 'RUT',
    type: 'text',
    autoComplete: 'off',
    placeholder: '12.345.678-9',
  },
]

const profileContactFieldConfig: ProfileFieldConfig[] = [
  {
    key: 'phone',
    label: 'Teléfono',
    type: 'tel',
    autoComplete: 'tel',
    placeholder: '+56 9 1234 5678',
  },
  {
    key: 'email',
    label: 'Correo electrónico',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'tu@correo.cl',
  },
]

const OTHER_PROFESSION_VALUE = 'other'

const professionOptions = [
  { value: 'Psicólogo', label: 'Psicólogo/a' },
  { value: 'Médico', label: 'Médico/a' },
  { value: 'Kinesiólogo', label: 'Kinesiólogo/a' },
  { value: 'Nutricionista', label: 'Nutricionista' },
  { value: 'Odontólogo', label: 'Odontólogo/a' },
  { value: 'Peluquero', label: 'Peluquero/a' },
  { value: 'Barbero', label: 'Barbero/a' },
  { value: 'Esteticista', label: 'Esteticista' },
  { value: 'Masajista', label: 'Masajista' },
  { value: 'Entrenador personal', label: 'Entrenador/a personal' },
  { value: 'Desarrollador de software', label: 'Desarrollador/a de software' },
  { value: 'Diseñador', label: 'Diseñador/a' },
  { value: 'Fotógrafo', label: 'Fotógrafo/a' },
  { value: 'Asesor', label: 'Asesor/a profesional' },
  { value: 'Profesor', label: 'Profesor/a' },
] as const

function isCommonProfession(value: string) {
  return professionOptions.some((option) => option.value === value)
}

type ProfileFieldProps = ProfileFieldConfig & {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function ProfileField({
  autoComplete,
  id,
  label,
  onChange,
  placeholder,
  type,
  value,
}: ProfileFieldProps & { id: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted" htmlFor={id}>
      {label}
      <AppInput
        autoComplete={autoComplete}
        id={id}
        name={id}
        onChange={onChange}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </label>
  )
}

type ProfilePhotoFieldProps = {
  firstName: string
  lastName: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  preview: string | null
  inputRef: RefObject<HTMLInputElement | null>
  error: string
}

type ProfessionFieldProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onManualChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function ProfessionField({ onChange, onManualChange, value }: ProfessionFieldProps) {
  const selectedValue = isCommonProfession(value) ? value : OTHER_PROFESSION_VALUE

  return (
    <div className="grid gap-3">
      <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted" htmlFor="profile-profession-choice">
        Profesión
        <AppSelect
          aria-describedby="profile-profession-help"
          aria-label="Profesión"
          id="profile-profession-choice"
          name="profession-choice"
          onChange={onChange}
          required
          value={selectedValue}
        >
          {professionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value={OTHER_PROFESSION_VALUE}>Otra</option>
        </AppSelect>
        <span className="normal-case font-medium tracking-normal text-ink-muted">
          <span id="profile-profession-help">
            Si no encuentras la tuya, selecciona “Otra”.
          </span>
        </span>
      </label>

      {selectedValue === OTHER_PROFESSION_VALUE ? (
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted" htmlFor="profile-profession-other">
          Especifica tu profesión
          <AppInput
            autoComplete="organization-title"
            id="profile-profession-other"
            name="profession-other"
            onChange={onManualChange}
            placeholder="Ej. Abogado"
            required
            type="text"
            value={value}
          />
        </label>
      ) : null}
    </div>
  )
}

function ProfilePhotoField({
  error,
  firstName,
  inputRef,
  lastName,
  onChange,
  preview,
}: ProfilePhotoFieldProps) {
  const initials = getProfileInitials({ firstName, lastName })
  const alt = `Foto de perfil de ${[firstName, lastName].filter(Boolean).join(' ')}`

  return (
    <div className="rounded-card border-2 border-ink bg-ink p-4 text-surface shadow-action sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start">
        <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-[2rem] border-2 border-ink bg-accent text-3xl font-bold text-accent-ink shadow-action-accent sm:size-32">
          {preview ? (
            <img alt={alt} className="size-full object-cover" src={preview} />
          ) : (
            <>
              <span aria-hidden="true">{initials}</span>
              <span className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full border-2 border-ink bg-surface text-ink shadow-outline">
                <Icon name="user" size={16} />
              </span>
            </>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Identidad visual
          </p>
          <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.05em]">
            Tu foto de perfil
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-surface/70">
            Ayuda a que tus clientes sepan con quién están agendando.
          </p>
          <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-control border-2 border-surface/40 px-4 text-sm font-bold text-surface transition hover:border-surface hover:bg-surface/10 focus-within:ring-4 focus-within:ring-focus/40">
            <Icon name="camera" size={17} />
            {preview ? 'Cambiar foto' : 'Subir foto'}
            <input
              ref={inputRef}
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={onChange}
              type="file"
            />
          </label>
          <p className="mt-2 text-xs text-surface/55">JPG, PNG o WEBP · máximo 5 MB</p>
          {error ? (
            <p className="mt-2 text-sm font-bold text-accent" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function getProfileInitials(profile: Pick<ProfessionalProfile, 'firstName' | 'lastName'>) {
  const initials = [profile.firstName, profile.lastName]
    .map((name) => name.trim().charAt(0))
    .filter(Boolean)
    .join('')

  return initials.slice(0, 2).toUpperCase() || 'AP'
}

export function ProfilePage() {
  const profile = useProfileStore((state) => state.profile)
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const resetProfile = useProfileStore((state) => state.resetProfile)
  const [draft, setDraft] = useState(profile)
  const [photoPreview, setPhotoPreview] = useState(profile.photoUrl)
  const [photoError, setPhotoError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  function handleFieldChange(field: ProfileFieldKey) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value

      setDraft((current) => ({ ...current, [field]: nextValue }))
      setSaveMessage('')
    }
  }

  function handleProfessionChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.currentTarget.value

    setDraft((current) => ({
      ...current,
      profession:
        nextValue === OTHER_PROFESSION_VALUE
          ? isCommonProfession(current.profession)
            ? ''
            : current.profession
          : nextValue,
    }))
    setSaveMessage('')
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Selecciona una imagen en formato JPG, PNG o WEBP.')
      event.currentTarget.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La imagen debe pesar menos de 5 MB.')
      event.currentTarget.value = ''
      return
    }

    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        return
      }

      setPhotoPreview(reader.result)
      setDraft((current) => ({ ...current, photoUrl: reader.result as string }))
      setPhotoError('')
      setSaveMessage('')
    })
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateProfile(draft)
    setSaveMessage('Perfil guardado en esta sesión de demo.')
  }

  function handleReset() {
    resetProfile()
    setDraft(demoProfessionalProfile)
    setPhotoPreview(demoProfessionalProfile.photoUrl)
    setPhotoError('')
    setSaveMessage('Datos demo restaurados.')

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <BannerWrapper
        ariaLabel="Introducción del perfil profesional"
        dismissLabel="Ocultar introducción del perfil"
        storageKey="profile-intro"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              <Icon name="user" size={15} />
              Tu identidad profesional
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-5xl">
              Que tu agenda diga <span className="scribble-underline">quién eres</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Completa tus datos para que tu perfil esté listo cuando llegue el momento de compartir tu agenda.
            </p>
          </div>
        </div>
      </BannerWrapper>

      <section aria-labelledby="profile-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              Información pública
            </p>
            <h2
              className="mt-1 font-display text-3xl font-bold tracking-[-0.06em] text-ink"
              id="profile-title"
            >
              Datos del profesional
            </h2>
          </div>
          <span className="rounded-pill bg-accent-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-accent-ink">
            Perfil de demo
          </span>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 lg:grid-cols-[minmax(15rem,0.75fr)_minmax(0,1.5fr)]">
            <ProfilePhotoField
              error={photoError}
              firstName={draft.firstName}
              inputRef={photoInputRef}
              lastName={draft.lastName}
              onChange={handlePhotoChange}
              preview={photoPreview}
            />

            <div className="rounded-card border-2 border-line bg-surface p-4 shadow-card sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {profileIdentityFieldConfig.map((field) => (
                  <ProfileField
                    {...field}
                    id={`profile-${field.key}`}
                    key={field.key}
                    onChange={handleFieldChange(field.key)}
                    value={draft[field.key]}
                  />
                ))}
                <ProfessionField
                  onChange={handleProfessionChange}
                  onManualChange={handleFieldChange('profession')}
                  value={draft.profession}
                />
                {profileContactFieldConfig.map((field) => (
                  <ProfileField
                    {...field}
                    id={`profile-${field.key}`}
                    key={field.key}
                    onChange={handleFieldChange(field.key)}
                    value={draft[field.key]}
                  />
                ))}
              </div>
              <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-muted">
                Estos datos se mostrarán en tu perfil cuando conectemos la agenda con tus clientes.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-card border-2 border-line bg-surface p-4 shadow-card sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted" role="status">
              {saveMessage || 'Los cambios se mantienen en esta sesión de demo.'}
            </p>
            <div className="flex w-fit max-w-full flex-wrap justify-end gap-2 self-end lg:self-auto">
              <AppButton
                className="shrink-0 whitespace-nowrap"
                onClick={handleReset}
                type="button"
                variant="outline"
              >
                Restaurar demo
              </AppButton>
              <AppButton className="shrink-0 whitespace-nowrap" type="submit" variant="accent">
                <Icon name="check" size={17} />
                Guardar perfil
              </AppButton>
            </div>
          </div>
        </form>
      </section>

      <p className="text-center text-xs text-ink-muted">
        La conexión con datos y autenticación llegará después de aprobar la interfaz.
      </p>
    </div>
  )
}
