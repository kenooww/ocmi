<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\ClientVerificationMail;
use App\Jobs\SendClientVerificationEmail;

class Client extends Authenticatable
{
    use Notifiable;

    public const CONTINUE_PROFILE_REQUIRED_FIELDS = [
        'first_name' => 'First name',
        'last_name' => 'Last name',
        'date_applied' => 'Date applied',
        'place_of_birth' => 'Place of birth',
        'date_of_birth' => 'Date of birth',
        'mothers_maiden_name' => "Mother's maiden name",
        'fathers_name' => "Father's name",
        'nationality' => 'Nationality',
        'current_position' => 'Current position',
        'position_applied_for' => 'Position applied for',
        'educational_attainment' => 'Educational attainment',
        'body_weight_bmi' => 'Body weight & BMI',
        'height_cm' => 'Height',
        'coverall_shoe_size' => 'Coverall & shoe size',
        'current_home_address' => 'Current home address',
        'personal_mobile_no' => 'Personal mobile number',
        'email_address' => 'Email address',
        'nearest_airport' => 'Nearest airport',
        'next_of_kin' => 'Next of kin',
        'relationship' => 'Relationship',
        'emergency_contact' => 'Emergency contact',
        'sss_no' => 'SSS number',
        'pagibig_no' => 'Pag-IBIG number',
        'philhealth_no' => 'PhilHealth number',
    ];

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'address', 'verification_token', 'email_verified_at',
        // profile fields
        'first_name','middle_name','last_name','date_applied',
        'place_of_birth','date_of_birth','mothers_maiden_name','fathers_name','nationality','religion',
        'current_position','position_applied_for','educational_attainment','last_salary','e_registration_number',
        'body_weight_bmi','height_cm','coverall_shoe_size',
        'current_home_address','personal_mobile_no','fax_no','email_address','nearest_airport',
        'next_of_kin','relationship','emergency_contact',
        'sss_no','pagibig_no','philhealth_no','avatar'
    ];

    protected $casts = [
        'date_applied' => 'date',
        'date_of_birth' => 'date',
        'email_verified_at' => 'datetime',
    ];

    protected $hidden = ['password', 'verification_token'];

    public function missingContinueProfileFields(): array
    {
        return collect(self::CONTINUE_PROFILE_REQUIRED_FIELDS)
            ->filter(fn ($label, $field) => blank($this->{$field}))
            ->values()
            ->all();
    }

    public function hasCompletedContinueProfile(): bool
    {
        return empty($this->missingContinueProfileFields());
    }

    public function dependents(): HasMany
    {
        return $this->hasMany(Dependent::class);
    }

    public function travelDocuments(): HasMany
    {
        return $this->hasMany(TravelDocument::class);
    }

    public function certificateCompetencies(): HasMany
    {
        return $this->hasMany(CertificateOfCompetency::class);
    }

    public function certificateProficiencies(): HasMany
    {
        return $this->hasMany(CertificateOfProficiency::class);
    }

    public function vaccinations(): HasMany
    {
        return $this->hasMany(Vaccination::class);
    }

    public function flagDocuments(): HasMany
    {
        return $this->hasMany(FlagDocument::class);
    }

    public function otherCertificates(): HasMany
    {
        return $this->hasMany(OtherCertificate::class);
    }

    public function employmentHistories(): HasMany
    {
        return $this->hasMany(EmploymentHistory::class);
    }

    public function seaServices(): HasMany
    {
        return $this->hasMany(SeaService::class);
    }

    public function deckOfficerExperiences(): HasMany
    {
        return $this->hasMany(DeckOfficerExperience::class);
    }

    protected static function booted()
    {
        static::creating(function ($client) {
            // ensure a verification token exists for new clients
            if (empty($client->verification_token)) {
                $client->verification_token = Str::random(40);
            }
        });

        static::created(function ($client) {
            // send verification email after creation (skip if already verified)
            if (! $client->email_verified_at) {
                $link = route('seafarers.verify', $client->verification_token);
                SendClientVerificationEmail::dispatch($client, $link);
            }
        });
    }
}
