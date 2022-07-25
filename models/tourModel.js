const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Um tour precisa ter um nome'],
      unique: true,
      trim: true,
      maxlength: [40, 'O nome de um tour precisa ter no máximo 40 caracteres'],
      minlength: [10, 'O nome de um tour precisa ter no mínimo 10 caracteres'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Um tour precisa ter uma duração'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Um tour precisa ter um tamanho de grupo'],
    },
    difficulty: {
      type: String,
      required: [true, 'Um tour precisa ter uma dificuldade definida'],
      enum: {
        // values: ['easy', 'medium', 'difficult'],
        // message: 'Difficulty is either: easy, medium, difficult',
        values: ['fácil', 'média', 'difícil'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Avaliações precisam ser mariores ou iguais a 1.0'],
      max: [5, 'Avaliações precisam ser menores ou iguais a 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Um tour precisa ter um preço'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'O desconto ({VALUE}) deve ser menor do que o preço do tour',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Um tour precisa ter uma descrição'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Um tour precisa ter uma imagem de capa'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v  -passwordChangedAt',
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Consulta demorou ${Date.now() - this.start} milissegundos!`);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
