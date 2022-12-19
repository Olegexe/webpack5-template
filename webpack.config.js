const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const fs = require("fs");
const PugPlugin = require('pug-plugin');

let mode = 'development';
if(process.env.NODE_ENV === 'production') {
  mode = 'production'
}

const PATHS = {
  src: path.join(__dirname, '/src'),
  dist: path.join(__dirname, '/dist'),
  assets: 'assets/'
}

const PAGES_DIR = `${PATHS.src}/pug/pages/`;
const getPages = function(dir, pages_) {
  pages_ = pages_ || [];
  pages = fs.readdirSync(dir).map(fileName => {
      let name = dir + '/' + fileName;
      if(fileName.endsWith('.pug')) {
          dir == PAGES_DIR ? pages_.push(fileName) : pages_.push(path.basename(path.dirname(name)) + '/' + fileName)
      }
      else if(fs.statSync(name).isDirectory()) getPages(name, pages_)
  })
  return pages_;
}
const PAGES = getPages(PAGES_DIR);

module.exports = {
  mode: mode,
  // entry: {
  //   main: './src/index.js',
  //   user: './src/user.js',
  //   userTestPage: `${PAGES_DIR}testPage/user.js`
  // },
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    assetModuleFilename: "assets/[hash][ext][query]",
    clean: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    hot: true,
    watchFiles: {
      paths: [PAGES_DIR, PATHS.src],
      options: {
        depth: 99,
      }
    },
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.pug',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: `[name].[contenthash].css`
    }),
    // ...PAGES.map(page => new HtmlWebpackPlugin({
    //   template: `${PAGES_DIR}/${page}`,
    //   filename: `./${path.basename(page).replace(/\.pug$/, '.html')}`
    // }))
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          (mode === "development") ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    {

                    }
                  ]
                ]
              }
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name][ext][query]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]'
        }
      },
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        exclude: '/(node_modules|bower_components)/'
      },
      {
        test: /\.m?js$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}